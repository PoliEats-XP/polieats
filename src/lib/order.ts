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
			include: { items: true },
		})

		if (!order) {
			throw new Error('Order not found.')
		}

		if (status && order.status !== status) {
			console.log('order.status', order.status)

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
		await this.getValidatedOrder(orderId, 'PENDING')

		return await prisma.order.findUnique({
			where: { id: orderId },
			include: { items: true },
		})
	}

	//Atualizar a quantidade dos items da order
	static async updateItemQuantity(
		orderId: string,
		itemId: string,
		quantity: number
	) {
		await this.getValidatedOrder(orderId, 'PENDING')

		const item = await prisma.item.findUnique({
			where: { id: itemId },
		})

		if (!item) {
			throw new Error('Item not found')
		}

		return await prisma.orderItem.upsert({
			where: {
				id: `${orderId}_${itemId}`,
			},
			update: {
				quantity,
			},
			create: {
				id: `${orderId}_${itemId}`,
				orderId,
				itemId,
				quantity,
				name: item.name,
				price: item.price,
			},
		})
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
		await this.getValidatedOrder(orderId, 'PENDING')

		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: { items: true },
		})

		if (!order) {
			throw new Error('Order not found')
		}

		return await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'COMPLETED',
				paymentMethod: paymentMethod,
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
		await this.getValidatedOrder(orderId, 'PENDING')

		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: { items: { include: { item: true } } },
		})

		if (!order) {
			throw new Error('Order not found')
		}

		const total = order.items.reduce((sum, orderItem) => {
			if (!orderItem.item) return sum
			return sum + orderItem.quantity * Number(orderItem.item.price)
		}, 0)

		await prisma.order.update({
			where: { id: orderId },
			data: { totalPrice: total },
		})

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
}
