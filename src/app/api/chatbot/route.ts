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
import { OrderRepository } from '@/lib/order'

// Configurações
const AI_CONFIG = {
	model: 'openai/gpt-4.1',
	temperature: 0.7,
	top_p: 1,
}

type PaymentMethod =
	| 'CASH'
	| 'CREDIT_CARD'
	| 'DEBIT_CARD'
	| 'PIX'
	| 'INDEFINIDO'

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

		// Check the last user message to determine if we're starting a new order
		const lastUserMessage =
			messages[messages.length - 1]?.content?.toLowerCase() || ''
		const isNewOrderRequest =
			lastUserMessage.includes('novo pedido') ||
			lastUserMessage.includes('começar de novo') ||
			lastUserMessage.includes('iniciar pedido') ||
			messages.length <= 1 // First message is always a new order

		// Check if user is mentioning payment method
		const mentionsPaymentMethod =
			lastUserMessage.includes('dinheiro') ||
			lastUserMessage.includes('cartão') ||
			lastUserMessage.includes('cartao') ||
			lastUserMessage.includes('crédito') ||
			lastUserMessage.includes('credito') ||
			lastUserMessage.includes('débito') ||
			lastUserMessage.includes('debito') ||
			lastUserMessage.includes('pix') ||
			lastUserMessage.includes('cash') ||
			lastUserMessage.includes('credit') ||
			lastUserMessage.includes('debit')

		// Initialize order only if explicitly requesting a new order or adding an item
		if (isNewOrderRequest) {
			// Always reset when explicitly requesting a new order
			await orderService.initializeOrder(true)
		} else {
			// Check if there's an existing order before initializing
			const existingOrder = await OrderRepository.findOrderByUserId(userId)

			if (!existingOrder) {
				// No existing order - create new one if adding items or mentioning payment method
				const mightBeAddingItems =
					lastUserMessage.includes('quero') ||
					lastUserMessage.includes('pedir') ||
					lastUserMessage.includes('adicionar') ||
					extractItemsWithQuantity(lastUserMessage, MENU).length > 0

				if (mightBeAddingItems || mentionsPaymentMethod) {
					await orderService.initializeOrder(true)
					console.log(
						'Created new order due to:',
						mightBeAddingItems ? 'items detected' : 'payment method mentioned'
					)
				}
			} else if (existingOrder.status === 'COMPLETED') {
				// For COMPLETED orders, check if user is adding new items or just updating payment
				const mightBeAddingItems =
					lastUserMessage.includes('quero') ||
					lastUserMessage.includes('pedir') ||
					lastUserMessage.includes('adicionar') ||
					extractItemsWithQuantity(lastUserMessage, MENU).length > 0

				if (mightBeAddingItems) {
					// User wants to add new items - create new order
					await orderService.initializeOrder(true)
					console.log(
						'Created new order because user is adding items to completed order'
					)
				} else if (mentionsPaymentMethod) {
					// User just wants to update payment method - use existing completed order
					await orderService.initializeOrder(false)
					console.log('Using existing completed order to update payment method')
				}
			} else {
				// Use existing pending order, or if user mentions payment method, ensure order is initialized
				if (mentionsPaymentMethod || existingOrder.status === 'PENDING') {
					await orderService.initializeOrder(false)
					console.log(
						'Using existing order for payment method or pending status'
					)
				}
			}
		}

		console.log('Order initialization complete, userId:', userId)
		console.log('Mentions payment method:', mentionsPaymentMethod)

		// Gera resposta da IA
		// console.log('Getting order summary...')
		let orderSummary = 'Nenhum item no pedido.'

		// Only get order summary if order is initialized
		try {
			orderSummary = await orderService.getOrderSummary()
		} catch (error) {
			console.log('Order not initialized yet, using default summary')
		}
		// console.log('Order summary result:', orderSummary)

		// Verify the order summary content
		if (
			orderSummary === 'Nenhum item no pedido.' &&
			(await orderService
				.getCurrentOrder()
				.then((order) => Object.keys(order.items).length > 0)
				.catch(() => false))
		) {
			// console.log(
			// 'Order summary is empty but current order has items. Getting current order manually.'
			// )
			try {
				const currentOrder = await orderService.getCurrentOrder()
				const items = Object.values(currentOrder.items).map(
					(item) => `- ${item.name} (quantidade: ${item.quant})`
				)
				orderSummary =
					items.length > 0
						? `Seu pedido atual:\n${items.join('\n')}\n\nTotal: R$ ${currentOrder.total.toFixed(2)}`
						: 'Nenhum item no pedido.'
				// console.log('Generated order summary manually:', orderSummary)
			} catch (error) {
				console.log('Could not get current order manually')
			}
		}

		const aiResponse = await aiService.generateResponse(
			messages,
			MENU,
			orderSummary
		)
		// console.log(`Resposta da IA: ${aiResponse}`)
		// console.log('order summary', orderSummary)
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
			// console.log('Processing commands:', commands)
			for (const command of commands)
				if (command.type === 'remove' && command.toDelete) {
					const idsToDelete = command.toDelete.map(
						(item: { id: string }) => item.id
					)
					// console.log('Deleting items:', idsToDelete)
					await orderService.deleteItems(idsToDelete)
				} else if (command.type === 'edit') {
					// console.log('Editing items:', command.items)
					for (const item of command.items) {
						// Ajusta a quantidade diretamente, sem remover e adicionar
						if (item.quant === 0) {
							// console.log('Deleting item with zero quantity:', item.id)
							await orderService.deleteItems([item.id])
						} else {
							try {
								// console.log('Updating items quantities:', command.items)
								await orderService.updateItemsQuantities(command.items)
							} catch (error) {
								if (
									error instanceof Error &&
									error.message.includes('Insufficient inventory')
								) {
									return jsonResponse(
										'error',
										`Estoque insuficiente: ${error.message}`
									)
								}
								throw error
							}
						}
					}
				}
		} else {
			// Processamento padrão se não houver comandos explícitos
			const extractedItems = extractItemsWithQuantity(aiResponse, MENU)
			// console.log('Extracted items from AI response:', extractedItems)

			// Adiciona ou atualiza cada item diretamente
			if (extractedItems.length > 0) {
				try {
					// console.log(
					// 	'Updating items quantities with extracted items:',
					// 	extractedItems
					// )
					await orderService.updateItemsQuantities(extractedItems)
				} catch (error) {
					if (
						error instanceof Error &&
						error.message.includes('Insufficient inventory')
					) {
						return jsonResponse(
							'error',
							`Estoque insuficiente: ${error.message}`
						)
					}
					throw error
				}
			} else if (aiResponse.includes('Pedido atualizado:')) {
				// Try a manual extraction if the automatic extraction failed
				// console.log('Trying manual extraction for "Pedido atualizado:" pattern')
				const pattern = /- ([^(]+)\s*\(\s*(\d+)\s*unidades?\)/gi
				let match = pattern.exec(aiResponse)
				const manualItems = []

				while (match !== null) {
					const itemName = match[1].trim()
					const quantity = Number.parseInt(match[2], 10)
					// console.log(
					// 	`Manual extraction: item="${itemName}", quantity=${quantity}`
					// )

					// Find the menu item
					const menuItem = MENU.find(
						(item: { id: string; nome: string }) =>
							item.nome.toLowerCase().includes(itemName.toLowerCase()) ||
							itemName.toLowerCase().includes(item.nome.toLowerCase())
					)

					if (menuItem && quantity > 0) {
						// console.log(`Found menu item for "${itemName}":`, menuItem)
						manualItems.push({ id: menuItem.id, quant: quantity })
					}

					match = pattern.exec(aiResponse)
				}

				if (manualItems.length > 0) {
					try {
						// console.log('Manually extracted items:', manualItems)
						await orderService.updateItemsQuantities(manualItems)
					} catch (error) {
						if (
							error instanceof Error &&
							error.message.includes('Insufficient inventory')
						) {
							return jsonResponse(
								'error',
								`Estoque insuficiente: ${error.message}`
							)
						}
						throw error
					}
				}
			}

			// Only try to get current order if it's initialized, wrapped in try-catch
			try {
				const [order] = await Promise.all([orderService.getCurrentOrder()])
				// console.log('Order Summary:', orderSummary)
				// console.log('Pedido atual:', JSON.stringify(order, null, 2))
			} catch (error) {
				console.log(
					'Could not get current order after processing, order might not be initialized'
				)
			}
		}

		//Pega total do pedido
		let totalPrice = 0
		try {
			totalPrice = await orderService.getTotalPrice()
		} catch (error) {
			console.log('Could not get total price, order might not be initialized')
		}
		// console.log('Order total price:', totalPrice)

		// Get a fresh order summary after all processing is complete
		let updatedOrderSummary = 'Nenhum item no pedido.'
		try {
			updatedOrderSummary = await orderService.getOrderSummary()
		} catch (error) {
			console.log('Could not get updated order summary')
		}
		// console.log('UPDATED Order Summary after processing:', updatedOrderSummary)

		// Get current order BEFORE confirming (important for status-dependent operations)
		let currentOrder
		try {
			currentOrder = await orderService.getCurrentOrder()
		} catch (error) {
			console.log('Could not get current order, using empty order structure')
			currentOrder = {
				items: {},
				total: 0,
				paymentMethod: null,
				status: 'PENDING',
			}
		}
		// console.log(
		// 	'Current order before confirmation:',
		// 	JSON.stringify(currentOrder, null, 2)
		// )

		// First check if order exists and has items
		if (
			!currentOrder ||
			!currentOrder.items ||
			Object.keys(currentOrder.items).length === 0
		) {
			console.warn('WARNING: Current order is empty or missing items')
		}

		// Get confirmation status and payment method
		let orderConfirmed = false
		let paymentMethod = null

		try {
			orderConfirmed = await orderService.isOrderConfirmed()
			paymentMethod = await orderService.getPaymentMethod()
		} catch (error) {
			console.log('Could not get order status, order might not be initialized')
		}

		// console.log(
		// 	'Initial order state - Confirmed:',
		// 	orderConfirmed,
		// 	'Payment Method:',
		// 	paymentMethod
		// )

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

		// Look for payment method in user messages only (not AI response)
		const normalizedUserMessage = normalizeText(lastUserMessage)

		console.log('Payment method detection:', {
			lastUserMessage,
			normalizedUserMessage,
			currentPaymentMethod: paymentMethod,
		})

		// Only look in user message, not AI response to avoid false positives
		let detectedPaymentMethod: PaymentMethod | null = null
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

		console.log('Final detected payment method:', detectedPaymentMethod)

		// Set payment method if detected
		if (detectedPaymentMethod) {
			console.log('Detected payment method:', detectedPaymentMethod)
			console.log('Current orderService state before setting payment method')

			// Ensure order is initialized before setting payment method
			try {
				// First try to set payment method on current order
				await orderService.setPaymentMethod(detectedPaymentMethod)
				paymentMethod = detectedPaymentMethod
				console.log('Successfully set payment method:', detectedPaymentMethod)
				console.log(
					'Payment method set but order not confirmed yet - waiting for user to say "confirmar"'
				)
			} catch (error: unknown) {
				console.log(
					'Could not set payment method, order might not be initialized'
				)
				console.log(
					'Error details:',
					error instanceof Error ? error.message : String(error)
				)
				// Order should already be initialized by the main logic above
				// If it still fails, log the error but don't create new orders
			}
		}

		// Check if user explicitly wants to confirm with keywords
		const userWantsToConfirm =
			lastUserMessage.includes('confirmar') ||
			lastUserMessage.includes('confirma') ||
			lastUserMessage.includes('finalizar') ||
			lastUserMessage.includes('fechar pedido') ||
			lastUserMessage.includes('concluir')

		// Get FRESH order data before confirmation check to ensure we have current state
		let freshOrder
		try {
			freshOrder = await orderService.getCurrentOrder()
		} catch (error) {
			console.log('Could not get fresh order for confirmation check')
			freshOrder = currentOrder
		}

		// Determine if we should confirm the order using FRESH data
		const hasItems = Object.keys(freshOrder.items).length > 0
		const hasValidPaymentMethod =
			(detectedPaymentMethod || paymentMethod) &&
			(detectedPaymentMethod || paymentMethod) !== 'INDEFINIDO'

		// More user-friendly confirmation logic:
		// Auto-confirm when user sets payment method AND has items, OR when user explicitly asks to confirm
		const shouldConfirmOrder =
			!orderConfirmed &&
			hasItems &&
			hasValidPaymentMethod &&
			(userWantsToConfirm || detectedPaymentMethod) // Auto-confirm when payment method is set

		console.log('Order confirmation check:', {
			lastUserMessage,
			orderConfirmed,
			hasItems,
			hasValidPaymentMethod,
			userWantsToConfirm,
			detectedPaymentMethod,
			paymentMethod,
			shouldConfirmOrder,
		})

		// If user wants to confirm but no payment method available, don't auto-confirm
		if (userWantsToConfirm && !hasValidPaymentMethod) {
			console.log(
				'User wants to confirm but no valid payment method available - will let AI ask for payment method'
			)
		}

		// Handle manual confirmation when user explicitly says "confirmar" and has a valid payment method
		if (shouldConfirmOrder) {
			console.log(
				'User wants to confirm order and has valid payment method - confirming now'
			)

			// Use detected payment method first, then existing
			const confirmPaymentMethod = (detectedPaymentMethod ||
				paymentMethod) as PaymentMethod

			try {
				console.log(
					`Confirming order with payment method: ${confirmPaymentMethod}`
				)
				console.log(
					'Order before confirmation:',
					JSON.stringify(freshOrder, null, 2)
				)

				await orderService.confirmOrder(confirmPaymentMethod)
				console.log('Order confirmed successfully')

				// Update the confirmed status immediately
				orderConfirmed = true
				paymentMethod = confirmPaymentMethod

				console.log('Order confirmed - status updated to:', orderConfirmed)

				// Get the final order state after confirmation to ensure we have the updated data
				try {
					currentOrder = await orderService.getCurrentOrder()
					console.log(
						'Final order after confirmation:',
						JSON.stringify(currentOrder, null, 2)
					)
					console.log(
						'Final order status from getCurrentOrder:',
						currentOrder.status
					)
				} catch (error) {
					console.log('Could not get final order after confirmation', error)
				}
			} catch (confirmError) {
				console.error('Error confirming order:', confirmError)
				if (
					confirmError instanceof Error &&
					confirmError.message.includes('Insufficient inventory')
				) {
					return jsonResponse(
						'error',
						`Não foi possível confirmar o pedido: ${confirmError.message}`
					)
				}
				return jsonResponse(
					'error',
					'Erro ao confirmar o pedido. Tente novamente.'
				)
			}
		}

		// Double-check final order status from database to ensure consistency
		try {
			const dbOrderConfirmed = await orderService.isOrderConfirmed()
			console.log('DB orderConfirmed status:', dbOrderConfirmed)
			console.log('Local orderConfirmed status:', orderConfirmed)

			// Use the DB status as the authoritative source
			orderConfirmed = dbOrderConfirmed

			console.log(
				'Final orderConfirmed status after double-check:',
				orderConfirmed
			)
		} catch (error) {
			console.log('Could not get final order status', error)
		}

		// Get final payment method from database to ensure UI gets latest value
		try {
			const finalPaymentMethod = await orderService.getPaymentMethod()
			console.log('Final payment method from DB:', finalPaymentMethod)
			if (finalPaymentMethod) {
				paymentMethod = finalPaymentMethod
			}
		} catch (error) {
			console.log('Could not get final payment method', error)
		}

		console.log('Final response values:', {
			orderConfirmed,
			paymentMethod,
			total: totalPrice || currentOrder.total,
		})

		// Add confirmation message if order was just confirmed
		let finalMessage = cleanResponse
		const wasJustConfirmed = orderConfirmed && shouldConfirmOrder

		if (wasJustConfirmed) {
			const paymentMethodText =
				paymentMethod === 'CREDIT_CARD'
					? 'Cartão de Crédito'
					: paymentMethod === 'DEBIT_CARD'
						? 'Cartão de Débito'
						: paymentMethod === 'CASH'
							? 'Dinheiro'
							: paymentMethod === 'PIX'
								? 'PIX'
								: 'Indefinido'

			// Show different messages for auto-confirmation vs explicit confirmation
			if (detectedPaymentMethod && !userWantsToConfirm) {
				// Auto-confirmed when payment method was set
				finalMessage = `✅ Pedido confirmado automaticamente!

Método de pagamento: ${paymentMethodText}
Total: R$ ${(totalPrice || currentOrder.total).toFixed(2)}

Obrigado pela preferência! Seu pedido está sendo preparado.`
			} else {
				// Explicitly confirmed by user
				finalMessage = `✅ Pedido confirmado com sucesso!

Método de pagamento: ${paymentMethodText}
Total: R$ ${(totalPrice || currentOrder.total).toFixed(2)}

Obrigado pela preferência! Seu pedido está sendo preparado.`
			}
		}

		// Retorna resposta
		return NextResponse.json({
			status: 'success',
			message: finalMessage,
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
