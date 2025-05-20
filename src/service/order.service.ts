import { OrderRepository } from '../lib/order'
import { MenuRepository } from '../lib/menu'
import type { Order } from '../types/order'
import type { Decimal } from 'decimal.js'

export class OrderService {
	private userId: string
	private orderId: string | null = null

	constructor(userId: string) {
		this.userId = userId
	}

	//Incializa a order
	async initializeOrder(): Promise<void> {
		const order = await OrderRepository.createOrder(this.userId)
		this.orderId = order.id
		console.log('order initialized')
	}

	//Atualiza a quantidade de items
	async updateItemsQuantities(
		items: { id: number; quant: number }[]
	): Promise<void> {
		if (!this.orderId) throw new Error('No order initialized.')

		const orderId = this.orderId!

		const itemsToUpdate = items.filter((item) => item.quant > 0)

		if (itemsToUpdate.length > 0) {
			await Promise.all(
				itemsToUpdate.map(async (item) => {
					await OrderRepository.updateItemQuantity(
						orderId,
						item.id.toString(),
						item.quant
					)
				})
			)
		}

		// Recalcula o total
		await OrderRepository.calculateOrderTotal(orderId)
	}

	//Exclui um ou vários items
	async deleteItems(ids: number[]): Promise<void> {
		if (!this.orderId) throw new Error('No order initialized.')

		for (const id of ids) {
			await OrderRepository.deleteOrderItem(this.orderId, id.toString())
		}

		await OrderRepository.calculateOrderTotal(this.orderId)
	}

	//Limpa a order
	async clearOrder(): Promise<void> {
		if (this.orderId) {
			await OrderRepository.clearOrder(this.orderId)
			await OrderRepository.calculateOrderTotal(this.orderId)
			console.log('Order cleared.')
		}
	}

	//Exclui a order
	async deleteOrder(): Promise<void> {
		if (this.orderId) {
			await OrderRepository.deleteOrder(this.orderId)
			this.orderId = null
			console.log('Order deleted.')
		}
	}

	//Pega um sumário dos items da order
	async getOrderSummary(): Promise<string> {
		if (!this.orderId) return 'No active order.'

		const order = await OrderRepository.getOrderById(this.orderId)
		if (!order || order.items.length === 0) {
			return 'Nenhum item no pedido.'
		}

		const menu = await MenuRepository.getMenuItems()
		const items = order.items
			.map((item: { itemId: unknown; quantity: unknown }) => {
				const menuItem = menu.find((m) => m.id === Number(item.itemId))
				return menuItem
					? `- ${menuItem.nome} (quantity: ${item.quantity})`
					: null
			})
			.filter(Boolean)

		const total = await OrderRepository.calculateOrderTotal(this.orderId)

		return items.length > 0
			? `Itens no pedido:\n${items.join('\n')}\nTotal: R$ ${total.toFixed(2)}`
			: 'Nenhum item no pedido.'
	}

	//Pega o valor total da order
	async getTotalPrice(): Promise<void> {
		if (this.orderId) {
			await OrderRepository.getTotalValue(this.orderId)
		}
	}

	//Define a order como confirmada
	async confirmOrder(paymentMethod: string): Promise<void> {
		if (!this.orderId) throw new Error('No order initialized.')
		await OrderRepository.confirmOrder(this.orderId, paymentMethod)
	}

	//Define o método de pagamento
	async setPaymentMethod(paymentMethod: string): Promise<void> {
		if (!this.orderId) throw new Error('No order initialized.')
		await OrderRepository.setPaymentMethod(this.orderId, paymentMethod)
	}

	//Verifica se a order esta confirmada
	async isOrderConfirmed(): Promise<boolean> {
		if (!this.orderId) throw new Error('No order initialized.')

		const order = await OrderRepository.orderStatus(this.orderId)

		return order?.status === 'CONFIRMED'
	}

	//Pega o metodo de pagamento
	async getPaymentMethod(): Promise<string | null> {
		if (!this.orderId) throw new Error('No order initialized.')

		const order = await OrderRepository.orderStatus(this.orderId)

		return order?.paymentMethod ?? null
	}

	//Pega os status da order atual
	async getCurrentOrder(): Promise<Order> {
		if (!this.orderId) throw new Error('No order initialized.')

		const order = await OrderRepository.getOrderById(this.orderId)
		const menu = await MenuRepository.getMenuItems()

		const itemsWithNames = order?.items.map(
			(item: {
				id: string
				name: string
				orderId: string
				itemId: string | null
				quantity: number
				price: Decimal
			}) => {
				const menuItem = menu.find((m) => m.id === Number(item.itemId))
				return {
					id: Number(item.itemId),
					quant: item.quantity,
					name: menuItem ? menuItem.nome : `Item ${item.itemId}`,
				}
			}
		)

		const total = await OrderRepository.calculateOrderTotal(this.orderId)

		return {
			items: itemsWithNames.reduce(
				(
					acc: { [x: string]: { quant: number; name: string } },
					item: { id: string | number; quant: number; name: string }
				) => {
					acc[item.id] = { quant: item.quant, name: item.name }
					return acc
				},
				{}
			),
			total,
		}
	}
}
