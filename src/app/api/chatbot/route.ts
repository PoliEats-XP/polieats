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

const MENU = await MenuRepository.getMenuItems()

export async function POST(req: NextRequest) {
	try {
		const { userId, messages } = await req.json()

		// Inicializa serviços
		const orderService = new OrderService(userId)
		const aiService = new AIService(
			process.env.OPEN_API_KEY || '',
			'https://models.github.ai/inference',
			AI_CONFIG
		)

		// Gera resposta da IA
		const orderSummary = await orderService.getOrderSummary()
		const aiResponse = await aiService.generateResponse(
			messages,
			MENU,
			orderSummary
		)
		console.log(`Resposta da IA: ${aiResponse}`)
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
			for (const command of commands)
				if (command.type === 'remove' && command.toDelete) {
					const idsToDelete = command.toDelete.map((item) => item.id)
					await orderService.deleteItems(idsToDelete)
				} else if (command.type === 'edit') {
					for (const item of command.items) {
						// Ajusta a quantidade diretamente, sem remover e adicionar
						if (item.quant === 0) {
							await orderService.deleteItems([item.id])
						} else {
							await orderService.updateItemsQuantities(command.items)
						}
					}
				}
		} else {
			// Processamento padrão se não houver comandos explícitos
			const extractedItems = extractItemsWithQuantity(aiResponse, MENU)

			// Adiciona ou atualiza cada item diretamente
			if (extractedItems.length > 0) {
				await orderService.updateItemsQuantities(extractedItems)
			}

			console.log(`Pedido atual: ${await orderService.getCurrentOrder()}`)
		}

		//Pega total do pedido
		const total = await orderService.getTotalPrice()

		// Confirma o pedido no backend
		if (cleanResponse.includes('Pedido confirmado com sucesso')) {
			await orderService.confirmOrder('') // Confirmamos sem método de pagamento definido
		}

		// Captura o método de pagamento no backend
		const paymentMethods = ['dinheiro', 'cartão', 'pix']
		for (const method of paymentMethods) {
			if (cleanResponse.toLowerCase().includes(method)) {
				await orderService.setPaymentMethod(method)
				break
			}
		}

		// Retorna resposta
		return NextResponse.json({
			status: 'success',
			message: cleanResponse,
			currentOrder: orderService.getCurrentOrder(),
			total: total,
			orderConfirmed: await orderService.isOrderConfirmed(),
			paymentMethod: await orderService.getPaymentMethod(),
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
