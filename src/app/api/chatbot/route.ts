import { type NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/service/order.service'
import { AIService } from '@/service/ai.service'
import {
	extractItemsWithQuantity,
	cleanAiResponse,
	hasSpecialCommand,
	processMultipleCommands,
} from '@/utils/parser.util'
import { ERROR_MESSAGES } from '@/constants/messages.const'
import { MenuRepository } from '@/lib/menu'

// Configurações
const AI_CONFIG = {
	model: 'openai/gpt-4.1',
	temperature: 0.7,
	top_p: 1,
}

type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX'

const MENU = await MenuRepository.getMenuItems()

export async function POST(req: NextRequest) {
	try {
		const { userId, messages } = await req.json()

		// Inicializa serviços
		const orderService = new OrderService(userId)

		console.log('userid', userId)

		const aiService = new AIService(
			process.env.OPEN_API_KEY || '',
			'https://models.github.ai/inference',
			AI_CONFIG
		)

		// Initialize order without resetting if it's already confirmed
		await orderService.initializeOrder(false) // Pass false to prevent resetting confirmed orders

		// Gera resposta da IA
		console.log('Getting order summary...')
		let orderSummary = await orderService.getOrderSummary()
		console.log('Order summary result:', orderSummary)

		// Verify the order summary content
		if (
			orderSummary === 'Nenhum item no pedido.' &&
			(await orderService
				.getCurrentOrder()
				.then((order) => Object.keys(order.items).length > 0))
		) {
			console.log(
				'Order summary is empty but current order has items. Getting current order manually.'
			)
			const currentOrder = await orderService.getCurrentOrder()
			const items = Object.values(currentOrder.items).map(
				(item) => `- ${item.name} (quantidade: ${item.quant})`
			)
			orderSummary =
				items.length > 0
					? `Seu pedido atual:\n${items.join('\n')}\n\nTotal: R$ ${currentOrder.total.toFixed(2)}`
					: 'Nenhum item no pedido.'
			console.log('Generated order summary manually:', orderSummary)
		}

		const aiResponse = await aiService.generateResponse(
			messages,
			MENU,
			orderSummary
		)
		console.log(`Resposta da IA: ${aiResponse}`)
		console.log('order summary', orderSummary)
		const cleanResponse = cleanAiResponse(aiResponse)

		// Processa comandos especiais

		//item não encontrado
		if (hasSpecialCommand(aiResponse, 'itemNaoEncontrado')) {
			return jsonResponse('error', ERROR_MESSAGES.ITEM_NOT_FOUND)
		}

		//pedido foi cancelado
		if (hasSpecialCommand(aiResponse, 'pedidoCancelado')) {
			if (Object.keys(orderService.getCurrentOrder()).length === 0) {
				return jsonResponse('error', ERROR_MESSAGES.INVALID_REQUEST)
			}
			orderService.clearOrder()
			return jsonResponse('error', ERROR_MESSAGES.ORDER_CANCELLED)
		}

		// Processa múltiplos comandos na mesma resposta ou pedidos unicos de remoção/adição
		const commands = processMultipleCommands(aiResponse, MENU)

		if (commands.length > 0) {
			console.log('Processing commands:', commands)
			for (const command of commands)
				if (command.type === 'remove' && command.toDelete) {
					const idsToDelete = command.toDelete.map(
						(item: { id: string }) => item.id
					)
					console.log('Deleting items:', idsToDelete)
					await orderService.deleteItems(idsToDelete)
				} else if (command.type === 'edit') {
					console.log('Editing items:', command.items)
					for (const item of command.items) {
						// Ajusta a quantidade diretamente, sem remover e adicionar
						if (item.quant === 0) {
							console.log('Deleting item with zero quantity:', item.id)
							await orderService.deleteItems([item.id])
						} else {
							console.log('Updating items quantities:', command.items)
							await orderService.updateItemsQuantities(command.items)
						}
					}
				}
		} else {
			// Processamento padrão se não houver comandos explícitos
			const extractedItems = extractItemsWithQuantity(aiResponse, MENU)
			console.log('Extracted items from AI response:', extractedItems)

			// Adiciona ou atualiza cada item diretamente
			if (extractedItems.length > 0) {
				console.log(
					'Updating items quantities with extracted items:',
					extractedItems
				)
				await orderService.updateItemsQuantities(extractedItems)
			} else if (aiResponse.includes('Pedido atualizado:')) {
				// Try a manual extraction if the automatic extraction failed
				console.log('Trying manual extraction for "Pedido atualizado:" pattern')
				const pattern = /- ([^(]+)\s*\(\s*(\d+)\s*unidades?\)/gi
				let match = pattern.exec(aiResponse)
				const manualItems = []

				while (match !== null) {
					const itemName = match[1].trim()
					const quantity = Number.parseInt(match[2], 10)
					console.log(
						`Manual extraction: item="${itemName}", quantity=${quantity}`
					)

					// Find the menu item
					const menuItem = MENU.find(
						(item: { id: string; nome: string }) =>
							item.nome.toLowerCase().includes(itemName.toLowerCase()) ||
							itemName.toLowerCase().includes(item.nome.toLowerCase())
					)

					if (menuItem && quantity > 0) {
						console.log(`Found menu item for "${itemName}":`, menuItem)
						manualItems.push({ id: menuItem.id, quant: quantity })
					}

					match = pattern.exec(aiResponse)
				}

				if (manualItems.length > 0) {
					console.log('Manually extracted items:', manualItems)
					await orderService.updateItemsQuantities(manualItems)
				}
			}

			const [order] = await Promise.all([orderService.getCurrentOrder()])

			console.log('Order Summary:', orderSummary)
			console.log('Pedido atual:', JSON.stringify(order, null, 2))
		}

		//Pega total do pedido
		const totalPrice = await orderService.getTotalPrice()
		console.log('Order total price:', totalPrice)

		// Get a fresh order summary after all processing is complete
		const updatedOrderSummary = await orderService.getOrderSummary()
		console.log('UPDATED Order Summary after processing:', updatedOrderSummary)

		// Get current order BEFORE confirming (important for status-dependent operations)
		const currentOrder = await orderService.getCurrentOrder()
		console.log(
			'Current order before confirmation:',
			JSON.stringify(currentOrder, null, 2)
		)

		// First check if order exists and has items
		if (
			!currentOrder ||
			!currentOrder.items ||
			Object.keys(currentOrder.items).length === 0
		) {
			console.warn('WARNING: Current order is empty or missing items')
		}

		// Get confirmation status and payment method
		let orderConfirmed = await orderService.isOrderConfirmed()
		let paymentMethod = await orderService.getPaymentMethod()

		console.log(
			'Initial order state - Confirmed:',
			orderConfirmed,
			'Payment Method:',
			paymentMethod
		)

		// Captura o método de pagamento no backend
		const paymentMethods: Record<string, PaymentMethod> = {
			cash: 'CASH',
			dinheiro: 'CASH',
			'em dinheiro': 'CASH',
			credit: 'CREDIT_CARD',
			crédito: 'CREDIT_CARD',
			credito: 'CREDIT_CARD',
			'cartão de crédito': 'CREDIT_CARD',
			'cartao de credito': 'CREDIT_CARD',
			debit: 'DEBIT_CARD',
			débito: 'DEBIT_CARD',
			debito: 'DEBIT_CARD',
			'cartão de débito': 'DEBIT_CARD',
			'cartao de debito': 'DEBIT_CARD',
			pix: 'PIX',
		}

		// Normalize text for payment method detection
		const normalizeText = (text: string): string => {
			return text
				.toLowerCase()
				.normalize('NFD')
				.replace(/\p{Diacritic}/gu, '') // Remove diacritics
		}

		// Look for payment method in both AI response and user messages
		const lastUserMessage =
			messages[messages.length - 1]?.content?.toLowerCase() || ''
		const normalizedResponse = normalizeText(cleanResponse)
		const normalizedUserMessage = normalizeText(lastUserMessage)

		// First look in AI response
		let detectedPaymentMethod: PaymentMethod | null = null
		for (const [keyword, method] of Object.entries(paymentMethods)) {
			const normalizedKeyword = normalizeText(keyword)
			if (normalizedResponse.includes(normalizedKeyword)) {
				console.log(
					`Detected payment method in AI response: ${keyword} -> ${method}`
				)
				detectedPaymentMethod = method
				break
			}
		}

		// Then check user message if method not found in AI response
		if (!detectedPaymentMethod) {
			for (const [keyword, method] of Object.entries(paymentMethods)) {
				const normalizedKeyword = normalizeText(keyword)
				if (normalizedUserMessage.includes(normalizedKeyword)) {
					console.log(
						`Detected payment method in user message: ${keyword} -> ${method}`
					)
					detectedPaymentMethod = method
					break
				}
			}
		}

		// Set payment method if detected
		if (detectedPaymentMethod) {
			console.log('Setting payment method to:', detectedPaymentMethod)
			await orderService.setPaymentMethod(detectedPaymentMethod)
			paymentMethod = detectedPaymentMethod
		}

		// Only try to confirm the order if not already confirmed
		if (
			!orderConfirmed &&
			(cleanResponse.includes('Pedido confirmado com sucesso') ||
				cleanResponse.includes('pedido confirmado') ||
				cleanResponse.toLowerCase().includes('confirmar o pedido'))
		) {
			console.log(
				'Confirming order with detected payment method:',
				detectedPaymentMethod || 'INDEFINIDO'
			)

			// Make sure we have items in the order before confirming
			if (Object.keys(currentOrder.items).length === 0) {
				// Check if any items were extracted from the message
				const extractedItems = extractItemsWithQuantity(aiResponse, MENU)
				if (extractedItems.length > 0) {
					console.log('Adding items before confirming order:', extractedItems)
					await orderService.updateItemsQuantities(extractedItems)

					// Refresh current order after adding items
					const refreshedOrder = await orderService.getCurrentOrder()
					console.log(
						'Refreshed order after adding items:',
						JSON.stringify(refreshedOrder, null, 2)
					)

					if (Object.keys(refreshedOrder.items).length === 0) {
						console.warn('WARNING: Still no items after trying to add them!')
					}
				} else {
					console.warn('WARNING: Confirming order with no items!')
				}
			}

			// Always use the detected payment method if available
			const confirmPaymentMethod = detectedPaymentMethod || 'INDEFINIDO'
			try {
				await orderService.confirmOrder(confirmPaymentMethod)
				console.log(
					'Order confirmed successfully with payment method:',
					confirmPaymentMethod
				)

				// Update the payment method and confirmed status
				orderConfirmed = true
				paymentMethod = confirmPaymentMethod

				// Get the final order state after confirmation
				const finalOrder = await orderService.getCurrentOrder()
				console.log(
					'Final order after confirmation:',
					JSON.stringify(finalOrder, null, 2)
				)
			} catch (confirmError) {
				console.error('Error confirming order:', confirmError)
			}
		}

		// Get final payment method
		if (paymentMethod !== detectedPaymentMethod && detectedPaymentMethod) {
			console.log(
				`Updating payment method from ${paymentMethod} to ${detectedPaymentMethod}`
			)
			try {
				await orderService.setPaymentMethod(detectedPaymentMethod)
				paymentMethod = detectedPaymentMethod
			} catch (paymentMethodError) {
				console.error('Error setting payment method:', paymentMethodError)
			}
		}

		// Double-check final order status
		orderConfirmed = await orderService.isOrderConfirmed()

		// Retorna resposta
		return NextResponse.json({
			status: 'success',
			message: cleanResponse,
			currentOrder: currentOrder,
			total: totalPrice || currentOrder.total,
			orderSummary: updatedOrderSummary,
			orderConfirmed: orderConfirmed,
			paymentMethod: paymentMethod,
		})
	} catch (error) {
		console.error('API Error:', error)
		return jsonResponse(
			'error',
			'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.'
		)
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonResponse(
	status: 'success' | 'error',
	message: string,
	data?: any
): NextResponse {
	return NextResponse.json({ status, message, ...(data && { data }) })
}
