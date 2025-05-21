import { OrderRepository } from '../lib/order'
import { MenuRepository } from '../lib/menu'
import type { Order, OrderItem } from '../types/order'

type PaymentMethod =
	| 'CASH'
	| 'CREDIT_CARD'
	| 'DEBIT_CARD'
	| 'PIX'
	| 'INDEFINIDO'

export class OrderService {
	private userId: string
	private orderId: string | null = null

	constructor(userId: string) {
		this.userId = userId
	}

	//Incializa a order
	async initializeOrder(resetIfCompleted = true): Promise<void> {
		// First check if user already has an active order
		try {
			console.log(`Initializing order for user ${this.userId}...`)

			if (!this.userId) {
				console.error('Cannot initialize order: userId is missing')
				throw new Error('User ID is required to initialize an order')
			}

			const existingOrder = await OrderRepository.findOrderByUserId(this.userId)

			if (existingOrder) {
				console.log(
					`Found existing order for user ${this.userId}:`,
					existingOrder.id
				)
				console.log(`Order status: ${existingOrder.status}`)

				// If order exists and is confirmed, either keep it or create new based on param
				if (existingOrder.status === 'COMPLETED' && resetIfCompleted) {
					console.log('Creating new order because existing one is completed')
					const newOrder = await OrderRepository.createOrder(this.userId)
					this.orderId = newOrder.id
					console.log('New order created with ID:', this.orderId)
					return
				}

				// For all existing orders (including COMPLETED if resetIfCompleted=false), use them
				console.log(`Using existing ${existingOrder.status} order`)
				this.orderId = existingOrder.id
				return
			}

			console.log('No existing order found, creating new one')
		} catch (error) {
			console.error('Error finding existing order:', error)
		}

		// Create a new order if needed
		console.log('Creating new order for user:', this.userId)
		const order = await OrderRepository.createOrder(this.userId)
		this.orderId = order.id
		console.log('New order initialized with ID:', this.orderId)
	}

	//Atualiza a quantidade de items
	async updateItemsQuantities(
		items: { id: string; quant: number }[]
	): Promise<void> {
		if (!this.orderId) throw new Error('No order initialized.')

		const orderId = this.orderId!

		const itemsToUpdate = items.filter((item) => item.quant > 0)

		if (itemsToUpdate.length > 0) {
			await Promise.all(
				itemsToUpdate.map(async (item) => {
					await OrderRepository.updateItemQuantity(orderId, item.id, item.quant)
				})
			)
		}

		// Recalcula o total
		await OrderRepository.calculateOrderTotal(orderId)
	}

	//Exclui um ou vários items
	async deleteItems(ids: string[]): Promise<void> {
		if (!this.orderId) throw new Error('No order initialized.')

		for (const id of ids) {
			await OrderRepository.deleteOrderItem(this.orderId, id)
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
		if (!this.orderId) {
			console.log('No orderId found in OrderService')
			return 'No active order.'
		}

		console.log('Fetching fresh order with ID:', this.orderId)
		const order = await OrderRepository.getOrderById(this.orderId)

		console.log('Retrieved order on getOrderSummary with structure:', {
			hasOrder: !!order,
			hasItems: !!order?.items,
			itemsLength: order?.items?.length,
			firstItem: order?.items?.[0],
			status: order?.status,
		})

		if (!order) {
			console.log('Order is null')
			return 'Nenhum item no pedido.'
		}

		// Log whether the order is completed
		console.log(
			`Order status: ${order.status}, has ${order.items?.length || 0} items`
		)

		// Check if items array is valid and has items
		if (
			!order.items ||
			!Array.isArray(order.items) ||
			order.items.length === 0
		) {
			console.log('Order has no items array or empty items array')

			// Always try getCurrentOrder as fallback
			try {
				const currentOrder = await this.getCurrentOrder()
				const itemCount = Object.keys(currentOrder.items).length
				console.log(`Fallback check: getCurrentOrder shows ${itemCount} items`)

				if (itemCount > 0) {
					// Format items from getCurrentOrder
					const items = Object.values(currentOrder.items).map(
						(item) => `- ${item.name} (quantidade: ${item.quant})`
					)
					console.log('Formatted items from getCurrentOrder:', items)

					return `Seu pedido atual:\n${items.join('\n')}\n\nTotal: R$ ${currentOrder.total.toFixed(2)}`
				}
			} catch (fallbackError) {
				console.error('Failed to get fallback order summary:', fallbackError)
			}

			return 'Nenhum item no pedido.'
		}

		console.log(
			'Order items full structure:',
			JSON.stringify(order.items, null, 2)
		)

		// Format items directly from order items - include price info
		const items = order.items
			.filter(
				(item) =>
					!!item && typeof item === 'object' && !!item.name && item.quantity > 0
			) // Filter out invalid items
			.map((item) => {
				// Use the orderItem quantity, not the item.item.quantity
				const quantity = item.quantity || 0
				console.log(
					`Processing item ${item.name}: orderItem quantity = ${quantity}`
				)

				const itemPrice = Number(item.price || 0) * quantity
				return `- ${item.name} (quantidade: ${quantity}, preço: R$ ${itemPrice.toFixed(2)})`
			})

		console.log('Formatted items:', items)

		// Calculate total manually to ensure it's correct
		const total = order.items.reduce((sum, item) => {
			return sum + Number(item.price || 0) * (item.quantity || 0)
		}, 0)

		console.log('Manually calculated total:', total)

		// Only show as confirmed if explicitly completed
		const isConfirmed = order.status === 'COMPLETED'
		const statusText = isConfirmed ? 'confirmado' : 'pendente'

		return items.length > 0
			? `Seu pedido ${statusText}:\n${items.join('\n')}\n\nTotal: R$ ${total.toFixed(2)}`
			: 'Nenhum item no pedido.'
	}

	//Pega o valor total da order
	async getTotalPrice(): Promise<number> {
		if (!this.orderId) {
			console.error('No order initialized when trying to get total price')
			return 0
		}

		console.log(`Getting total price for order: ${this.orderId}`)

		try {
			const total = await OrderRepository.calculateOrderTotal(this.orderId)
			console.log(`Total price for order ${this.orderId}: ${total}`)
			return total
		} catch (error) {
			console.error(
				`Error getting total price for order ${this.orderId}:`,
				error
			)
			return 0
		}
	}

	//Define a order como confirmada
	async confirmOrder(paymentMethod: PaymentMethod): Promise<void> {
		if (!this.orderId) throw new Error('No order initialized.')
		await OrderRepository.confirmOrder(this.orderId, paymentMethod)
	}

	//Define o método de pagamento
	async setPaymentMethod(paymentMethod: PaymentMethod): Promise<void> {
		if (!this.orderId) throw new Error('No order initialized.')
		await OrderRepository.setPaymentMethod(this.orderId, paymentMethod)
	}

	//Verifica se a order esta confirmada
	async isOrderConfirmed(): Promise<boolean> {
		if (!this.orderId) throw new Error('No order initialized.')

		const order = await OrderRepository.orderStatus(this.orderId)

		return order?.status === 'COMPLETED'
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

		console.log('Getting current order for ID:', this.orderId)
		const order = await OrderRepository.getOrderById(this.orderId)
		const menu = await MenuRepository.getMenuItems()

		console.log(
			'Raw order for getCurrentOrder:',
			JSON.stringify(order, null, 2)
		)
		console.log(
			'Menu items sample:',
			menu
				.slice(0, 3)
				.map((m: { id: string | number; nome: string; price: number }) => ({
					id: m.id,
					nome: m.nome,
					price: m.price,
				}))
		)

		if (!order || !order.items || !Array.isArray(order.items)) {
			console.log('Order is missing or has no items array')
			return { items: {}, total: 0, paymentMethod: null, status: 'PENDING' }
		}

		console.log(
			'Processing items for getCurrentOrder:',
			order.items.length,
			'items'
		)

		// Process all items, ensuring we get the correct price and quantity
		const itemsWithNames = order.items
			.filter((item) => !!item && item.quantity > 0)
			.map((item) => {
				console.log('Processing item in getCurrentOrder:', {
					id: item.id,
					itemId: item.itemId,
					name: item.name,
					price: item.price,
					quantity: item.quantity,
				})

				// Find matching menu item for additional context
				const menuItem = menu.find(
					(m: { id: number | string; nome: string }) =>
						String(m.id) === String(item.itemId)
				)

				if (menuItem) {
					console.log('Found menu item:', {
						id: menuItem.id,
						name: menuItem.nome,
						menuPrice: menuItem.price,
					})
				}

				if (!item.itemId) {
					console.warn('Item has no itemId:', item)
					return null
				}

				return {
					id: item.itemId,
					quant: item.quantity,
					name:
						item.name ||
						(menuItem ? menuItem.nome : `Unknown Item ${item.itemId}`),
					price: String(item.price || 0),
				}
			})
			.filter(
				(
					item
				): item is { id: string; quant: number; name: string; price: string } =>
					item !== null
			)

		console.log(
			'Processed items with names and prices:',
			itemsWithNames.map((item) => ({
				id: item.id,
				name: item.name,
				quant: item.quant,
				price: item.price,
				lineTotal: Number(item.price) * item.quant,
			}))
		)

		// Calculate total manually to ensure it's accurate
		const total = itemsWithNames.reduce((sum, item) => {
			const itemPrice = Number(item.price || 0)
			const lineTotal = itemPrice * item.quant
			console.log(
				`Item ${item.name}: ${item.quant} x ${itemPrice} = ${lineTotal}`
			)
			return sum + lineTotal
		}, 0)

		console.log('Manually calculated total for getCurrentOrder:', total)

		// Convert items to the format expected by the frontend
		const formattedItems = itemsWithNames.reduce(
			(acc, item) => {
				acc[item.id] = {
					id: item.id,
					quant: item.quant,
					name: item.name,
					price: item.price,
				}
				return acc
			},
			{} as Record<string, OrderItem>
		)

		return {
			items: formattedItems,
			total,
			paymentMethod: order?.paymentMethod ?? null,
			status: order?.status || 'PENDING',
		}
	}
}
