import type { MenuItem } from '../types/order'
import { ITEM_REGEX } from '../constants/regex.const'

interface ProcessedCommand {
	type: 'remove' | 'edit'
	items: { id: string; quant: number }[]
	toDelete?: { id: string }[]
}

export function extractItemsWithQuantity(
	response: string,
	menu: MenuItem[],
	isRemoval = false
): { id: string; quant: number }[] {
	console.log('Extracting items from response:', response)
	console.log('Menu items:', menu)
	const extractedItems: { id: string; quant: number }[] = []
	const relevantResponse =
		response.split('Deseja adicionar mais itens ao pedido?')[0] || response

	// First try direct pattern matching for various item formats
	const patterns = [
		/- ([^(]+)\s*\(\s*(\d+)\s*unidades?\)/gi, // - item (X unidades)
		/- ([^:]+):\s*(\d+)\s*unidades?/gi, // - item: X unidades
		/(\d+)\s*(?:x|unidades?\s+de)\s+([^,.]+)/gi, // X unidades de item or Xx item
	]

	for (const pattern of patterns) {
		let match = pattern.exec(relevantResponse)
		while (match !== null) {
			// Extract item name and quantity based on pattern
			const itemName = (
				pattern.source.includes('unidades?\\s+de') ? match[2] : match[1]
			)
				.trim()
				.toLowerCase()
			const quantity = Number.parseInt(
				pattern.source.includes('unidades?\\s+de') ? match[1] : match[2],
				10
			)

			console.log(
				`Direct pattern match: item="${itemName}", quantity=${quantity}`
			)

			// Find the menu item by name
			const menuItem = menu.find(
				(item) =>
					item.nome.toLowerCase().includes(itemName) ||
					itemName.includes(item.nome.toLowerCase())
			)

			if (menuItem && !Number.isNaN(quantity) && quantity > 0) {
				console.log(`Found menu item for "${itemName}":`, menuItem)
				// Check if item already exists in the list
				const existingItemIndex = extractedItems.findIndex(
					(i) => i.id === menuItem.id
				)
				if (existingItemIndex >= 0) {
					// Update quantity of existing item
					extractedItems[existingItemIndex].quant = quantity
				} else {
					// Add new item
					extractedItems.push({ id: menuItem.id, quant: quantity })
				}
			}

			match = pattern.exec(relevantResponse)
		}
	}

	// If no items were found with the direct patterns, use the original method
	if (extractedItems.length === 0) {
		for (const item of menu) {
			const quantity = findQuantityInText(
				item.nome,
				relevantResponse,
				isRemoval
			)
			console.log(`Checking item ${item.nome}:`, { quantity })

			if (!Number.isNaN(quantity) && quantity !== 0) {
				extractedItems.push({ id: item.id, quant: quantity })
			}
		}
	}

	console.log('Extracted items:', extractedItems)
	return extractedItems
}

function findQuantityInText(
	itemName: string,
	text: string,
	isRemoval: boolean
): number {
	const lowerName = itemName.toLowerCase()
	const lowerText = text.toLowerCase()
	let quantity = 0

	// First check for the pattern "item (X unidades)" which is used in AI responses
	const unitPattern = new RegExp(
		`${lowerName}\\s*\\(\\s*(\\d+)\\s*unidades?\\)`,
		'i'
	)
	const unitMatch = lowerText.match(unitPattern)
	if (unitMatch?.[1]) {
		console.log(`Found unit pattern match for ${itemName}:`, unitMatch[1])
		const num = Number(unitMatch[1])
		if (!Number.isNaN(num)) {
			return isRemoval ? -num : num
		}
	}

	// First try to find exact matches with numbers
	const exactPattern = new RegExp(
		`(\\d+)\\s*${lowerName}|${lowerName}\\s*(\\d+)`,
		'i'
	)
	const exactMatch = lowerText.match(exactPattern)
	if (exactMatch) {
		const num = Number(exactMatch[1] || exactMatch[2])
		if (!Number.isNaN(num)) {
			return isRemoval ? -num : num
		}
	}

	// Then try the regex patterns
	for (const { regex, groupIndex } of ITEM_REGEX) {
		const pattern = new RegExp(regex.replace('{item}', lowerName), 'i')
		const match = lowerText.match(pattern)

		// biome-ignore lint/complexity/useOptionalChain: <explanation>
		if (match && match[groupIndex]) {
			const extractedQuant = Number.parseInt(match[groupIndex])
			if (!Number.isNaN(extractedQuant)) {
				quantity = isRemoval ? -extractedQuant : extractedQuant
				break
			}
		}
	}

	return quantity
}

// Nova função para processar comandos múltiplos
export function processMultipleCommands(
	response: string,
	menu: MenuItem[]
): ProcessedCommand[] | any[] {
	const commands: ProcessedCommand[] | any[] = []
	let currentType: 'remove' | 'edit' | null = null

	// Check for simple item pattern first (even without explicit commands)
	if (response.includes('Pedido atualizado:')) {
		console.log('Found "Pedido atualizado:" pattern')
		const items = extractItemsWithQuantity(response, menu)
		if (items.length > 0) {
			console.log('Extracted items from "Pedido atualizado:":', items)
			commands.push({
				type: 'edit',
				items,
			})
			return commands
		}
	}

	// Divide a resposta em partes usando os marcadores
	const parts = response.split(/(\[.*?\])/g)

	// biome-ignore lint/complexity/noForEach: <explanation>
	parts.forEach((part) => {
		if (part === '[removerItem]') {
			currentType = 'remove'
		} else if (part === '[editarItem]') {
			currentType = 'edit'
		} else if (currentType) {
			if (currentType === 'remove') {
				const toDelete = extractItemIdsFromRemoviLine(part, menu)
				if (toDelete.length > 0) {
					commands.push({
						type: currentType,
						items: [], // vazio para delete puro
						toDelete, // considerando apenas um item deletado
					})
				}
			} else {
				const items = extractItemIdsFromEditLine(part, menu)
				if (items.length > 0) {
					commands.push({
						type: currentType,
						items,
					})
				}
			}
		}
	})

	return commands
}

function extractItemIdsFromRemoviLine(
	text: string,
	menu: MenuItem[]
): { id: string }[] {
	const result: { id: string }[] = []

	const lines = text.split('\n').map((line) => line.trim())
	const remLine = lines.find((line) => /^removi/i.test(line))

	if (!remLine) return result

	for (const item of menu) {
		const pattern = new RegExp(`removi\\s+(?:o|a)?\\s*${item.nome}`, 'i')
		if (pattern.test(remLine)) {
			result.push({ id: item.id })
		}
	}

	return result
}

function extractItemIdsFromEditLine(
	text: string,
	menu: MenuItem[]
): { id: string; quant: number }[] {
	const result: { id: string; quant: number }[] = []
	const foundIds = new Set<string>()

	// Padrão para identificar a frase "Alterado <item> para <quantidade> unidades"
	const editPattern = /alterado\s+([\w\s]+)\s+para\s+(\d+)\s+unidades?/gi

	let match
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((match = editPattern.exec(text)) !== null) {
		const itemName = match[1].trim().toLowerCase()
		const quantity = Number.parseInt(match[2], 10)

		if (Number.isNaN(quantity)) continue

		// Busca o item correspondente no menu
		for (const item of menu) {
			if (
				itemName.includes(item.nome.toLowerCase()) &&
				!foundIds.has(item.id)
			) {
				result.push({ id: item.id, quant: quantity })
				foundIds.add(item.id)
				break
			}
		}
	}

	return result
}

export function cleanAiResponse(response: string): string {
	return response.replace(/\[.*?\]/g, '')
}

export function hasSpecialCommand(response: string, command: string): boolean {
	return response.includes(`[${command}]`)
}
