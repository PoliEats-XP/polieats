import { prisma } from '@/lib/prisma'
import { sendNotificationToUser } from '@/lib/sse-connections'

type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

interface CreateNotificationParams {
	userId: string
	title: string
	message: string
	orderId?: string
	type?: 'ORDER_UPDATE' | 'GENERAL'
}

export async function createNotification({
	userId,
	title,
	message,
	orderId,
	type = 'ORDER_UPDATE',
}: CreateNotificationParams) {
	try {
		// Create notification in database
		const notification = await prisma.notification.create({
			data: {
				userId,
				title,
				message,
				orderId,
				type,
			},
			include: {
				order: {
					select: {
						id: true,
						status: true,
						totalPrice: true,
					},
				},
			},
		})

		// Transform notification for real-time sending
		const transformedNotification = {
			id: notification.id,
			title: notification.title,
			message: notification.message,
			type: notification.type,
			read: notification.read,
			createdAt: notification.createdAt.toISOString(),
			order: notification.order
				? {
						id: notification.order.id,
						status: notification.order.status,
						totalPrice: Number(notification.order.totalPrice),
					}
				: null,
		}

		// Send notification via SSE to connected user
		sendNotificationToUser(userId, transformedNotification)

		return notification
	} catch (error) {
		console.error('Error creating notification:', error)
		throw error
	}
}

export async function createOrderStatusNotification(
	userId: string,
	orderId: string,
	oldStatus: OrderStatus,
	newStatus: OrderStatus
) {
	const statusMessages = {
		PENDING: 'Seu pedido está sendo preparado',
		COMPLETED: 'Seu pedido foi finalizado e está pronto!',
		CANCELLED: 'Seu pedido foi cancelado',
	}

	const title = 'Atualização do Pedido'
	const message = statusMessages[newStatus] || 'Status do pedido atualizado'

	return createNotification({
		userId,
		title,
		message,
		orderId,
		type: 'ORDER_UPDATE',
	})
}

export async function markNotificationsAsRead(
	notificationIds: string[],
	userId: string
) {
	try {
		await prisma.notification.updateMany({
			where: {
				id: { in: notificationIds },
				userId, // Ensure user can only update their own notifications
			},
			data: {
				read: true,
			},
		})
	} catch (error) {
		console.error('Error marking notifications as read:', error)
		throw error
	}
}

export async function getUnreadNotificationCount(
	userId: string
): Promise<number> {
	try {
		return await prisma.notification.count({
			where: {
				userId,
				read: false,
			},
		})
	} catch (error) {
		console.error('Error getting unread notification count:', error)
		return 0
	}
}
