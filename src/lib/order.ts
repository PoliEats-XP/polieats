import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

interface OrderUpsert {
	where: {
		orderId_itemId: {
			orderId: string
			itemId: string
		}
	}
	create: {
		orderId: string
		itemId: string
		quantity: number
	}
	update: {
		quantity: number
	}
}

type PaymentMethod =
	| 'CASH'
	| 'CREDIT_CARD'
	| 'DEBIT_CARD'
	| 'PIX'
	| 'INDEFINIDO'

export class OrderRepository {
	// validação(banco) para ver se Order existe
	private static async getValidatedOrder(orderId: string, status?: string) {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				items: {
					include: {
						item: true,
					},
				},
			},
		})

		if (!order) {
			throw new Error('Order not found.')
		}

		if (status && order.status !== status) {
			console.log('order.status', order.status)

			// For read operations, don't throw an error for COMPLETED orders
			if (order.status === 'COMPLETED' && !status.includes('WRITE_OPERATION')) {
				console.log('Order is COMPLETED but allowing read operation')
				return order
			}

			throw new Error(`Order must be in ${status} status.`)
		}

		return order
	}

	//Criar a order
	static async createOrder(userId: string) {
		return await prisma.order.create({
			data: {
				userId: userId,
				totalPrice: 0,
			},
		})
	}

	//Pegar a order pelo orderId
	static async getOrderById(orderId: string) {
		await this.getValidatedOrder(orderId)

		console.log('Fetching order with ID:', orderId)
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				items: {
					include: {
						item: true,
					},
				},
			},
		})
		console.log('Raw order from database:', JSON.stringify(order, null, 2))
		console.log(
			'Order items:',
			order?.items?.map((item) => ({
				id: item.id,
				itemId: item.itemId,
				name: item.name,
				quantity: item.quantity,
				price: item.price,
			}))
		)
		return order
	}

	//Atualizar a quantidade dos items da order
	static async updateItemQuantity(
		orderId: string,
		itemId: string,
		quantity: number
	) {
		await this.getValidatedOrder(orderId, 'PENDING')

		console.log('Looking for item with ID:', itemId)
		let item = await prisma.item.findUnique({
			where: { id: itemId },
		})
		console.log('Found item:', item)

		if (!item) {
			// Try to find the item by name as a fallback
			console.log('Item not found by ID, trying to find by name...')
			const items = await prisma.item.findMany({
				where: {
					name: itemId,
				},
			})
			console.log('Found items by name:', items)

			if (items.length === 0) {
				throw new Error('Item not found')
			}
			item = items[0]
		}

		console.log('Updating item quantity:', {
			orderId,
			itemId,
			quantity,
			itemPrice: item.price,
			itemName: item.name,
		})

		// First try to find existing order item
		const existingOrderItem = await prisma.orderItem.findFirst({
			where: {
				orderId: orderId,
				itemId: itemId,
			},
		})

		if (existingOrderItem) {
			console.log('Updating existing order item:', existingOrderItem)
			const updated = await prisma.orderItem.update({
				where: { id: existingOrderItem.id },
				data: {
					quantity,
					price: item.price, // Ensure price comes from the item definition
				},
			})
			console.log('Updated order item:', updated)
			return updated
		}

		console.log('Creating new order item with price:', item.price)
		const created = await prisma.orderItem.create({
			data: {
				orderId,
				itemId,
				quantity,
				name: item.name,
				price: item.price, // Ensure price comes from the item definition
			},
		})
		console.log('Created new order item:', created)
		return created
	}

	//Limpar(deletar) todos os items da order
	static async clearOrder(orderId: string) {
		await this.getValidatedOrder(orderId, 'PENDING')

		return await prisma.orderItem.deleteMany({
			where: { orderId: orderId },
		})
	}

	//Deletar a order
	static async deleteOrder(orderId: string) {
		return await prisma.order.delete({
			where: { id: orderId },
		})
	}

	//Deletar um (ou vários) items em especifico da order
	static async deleteOrderItem(orderId: string, itemId: string) {
		await this.getValidatedOrder(orderId, 'PENDING')

		return await prisma.orderItem.deleteMany({
			where: {
				orderId: orderId,
				itemId: itemId,
			},
		})
	}

	//Define o método de pagamento e o status da order como confirmed
	static async confirmOrder(orderId: string, paymentMethod: PaymentMethod) {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				items: {
					include: { item: true },
				},
			},
		})

		if (!order) {
			throw new Error('Order not found')
		}

		console.log(
			`Confirming order ${orderId} with payment method ${paymentMethod}`
		)
		console.log('Items to preserve:', JSON.stringify(order.items, null, 2))

		// Check if order has items
		if (!order.items || order.items.length === 0) {
			console.warn('WARNING: Confirming order with no items!')
		}

		// Keep track of the current order status
		const currentStatus = order.status
		console.log(`Current order status before confirmation: ${currentStatus}`)

		// Only update to COMPLETED if not already completed
		if (currentStatus === 'COMPLETED') {
			console.log('Order is already completed, only updating payment method')
			return await prisma.order.update({
				where: { id: orderId },
				data: {
					paymentMethod: paymentMethod,
				},
				include: {
					items: {
						include: { item: true },
					},
				},
			})
		}

		// Set the order as COMPLETED
		return await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'COMPLETED',
				paymentMethod: paymentMethod,
			},
			include: {
				items: {
					include: { item: true },
				},
			},
		})
	}

	//Pega a grande parte dos status da order
	static async orderStatus(orderId: string) {
		await this.getValidatedOrder(orderId, 'PENDING')

		return await prisma.order.findUnique({
			where: { id: orderId },
		})
	}

	//Define o status da order como cancelled
	static async cancelOrder(orderId: string) {
		await this.getValidatedOrder(orderId, 'PENDING')

		return await prisma.order.update({
			where: { id: orderId },
			data: { status: 'CANCELLED' },
		})
	}

	//Define o método de pagamento
	static async setPaymentMethod(
		orderId: string,
		paymentMethod: PaymentMethod
	): Promise<void> {
		await this.getValidatedOrder(orderId, 'PENDING')

		await prisma.order.update({
			where: { id: orderId },
			data: {
				paymentMethod: paymentMethod,
			},
		})
	}

	//Calcula o total da order
	static async calculateOrderTotal(orderId: string): Promise<number> {
		// Use status check without strict validation for completed orders
		await this.getValidatedOrder(orderId)

		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				items: true, // Include only the OrderItems
			},
		})

		if (!order) {
			throw new Error('Order not found')
		}

		console.log(
			'Calculating total for order items:',
			order.items.map((item) => ({
				id: item.id,
				name: item.name,
				quantity: item.quantity,
				price: item.price,
				lineTotal: Number(item.price) * item.quantity,
			}))
		)

		// Calculate total directly from orderItems without item relationship
		const total = order.items.reduce((sum, orderItem) => {
			const itemPrice = Number(orderItem.price)
			const itemTotal = itemPrice * orderItem.quantity
			console.log(
				`Item ${orderItem.name}: ${orderItem.quantity} x ${itemPrice} = ${itemTotal}`
			)
			return sum + itemTotal
		}, 0)

		console.log(`Calculated order total: ${total}`)

		// Only update the total if the order is still PENDING
		if (order.status === 'PENDING') {
			await prisma.order.update({
				where: { id: orderId },
				data: { totalPrice: total },
			})
		}

		return total
	}

	//Pega o total da order
	static async getTotalValue(orderId: string): Promise<number> {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: { totalPrice: true },
		})

		if (!order) {
			throw new Error('Order not found')
		}

		return Number(order.totalPrice)
	}

	// Find order by user ID
	static async findOrderByUserId(userId: string) {
		const order = await prisma.order.findFirst({
			where: {
				userId: userId,
				// Optionally prioritize PENDING orders
				OR: [{ status: 'PENDING' }, { status: 'COMPLETED' }],
			},
			orderBy: {
				// Most recent first
				updatedAt: 'desc',
			},
			include: {
				items: {
					include: { item: true },
				},
			},
		})
		return order
	}
}
