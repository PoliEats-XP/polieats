import type { MenuItem } from '../types/order'
import { ITEM_REGEX } from '../constants/regex.const'

interface ProcessedCommand {
	type: 'remove' | 'edit'
	items: { id: number; quant: number }[]
	toDelete?: { id: number }[]
}

export function extractItemsWithQuantity(
	response: string,
	menu: MenuItem[],
	isRemoval = false
): { id: number; quant: number }[] {
	const extractedItems: { id: number; quant: number }[] = []
	const relevantResponse =
		response.split('Deseja adicionar mais itens ao pedido?')[0] || response

	for (const item of menu) {
		const quantity = findQuantityInText(item.nome, relevantResponse, isRemoval)

		if (!Number.isNaN(quantity) && quantity !== 0) {
			extractedItems.push({ id: item.id, quant: quantity })
		}
	}

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
): ProcessedCommand[] {
	const commands: ProcessedCommand[] = []
	let currentType: 'remove' | 'edit' | null = null

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
): { id: number }[] {
	const result: { id: number }[] = []

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
): { id: number; quant: number }[] {
	const result: { id: number; quant: number }[] = []
	const foundIds = new Set<number>()

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
