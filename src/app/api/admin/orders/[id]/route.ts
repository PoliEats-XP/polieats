import { betterFetch } from '@better-fetch/fetch'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Session } from '@/lib/auth'
import { createOrderStatusNotification } from '@/service/notification'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { data: session } = await betterFetch<Session>(
			'/api/auth/get-session',
			{
				baseURL: process.env.BETTER_AUTH_URL,
				headers: {
					cookie: request.headers.get('cookie') || '',
				},
			}
		)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check if user is admin or master
		if (session.user.role !== 'admin' && session.user.role !== 'master') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { id: orderId } = await params

		// Fetch the specific order
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				items: {
					include: {
						item: true,
					},
				},
			},
		})

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 })
		}

		// Transform the data to match the expected format
		const transformedOrder = {
			id: order.id,
			status: order.status === 'CANCELLED' ? 'CANCELED' : order.status,
			date: order.createdAt.toLocaleString('pt-BR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			}),
			total: Number(order.totalPrice),
			paymentMethod: order.paymentMethod,
			user: {
				id: order.user.id,
				name: order.user.name,
				email: order.user.email,
			},
			itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
			items: order.items.map((orderItem) => ({
				name: orderItem.name,
				price: Number(orderItem.price),
				quantity: orderItem.quantity,
			})),
			rating: order.rating,
			feedback: order.feedback,
			feedbackAt: order.feedbackAt?.toISOString(),
		}

		return NextResponse.json(transformedOrder)
	} catch (error) {
		console.error('Error fetching order details:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { data: session } = await betterFetch<Session>(
			'/api/auth/get-session',
			{
				baseURL: process.env.BETTER_AUTH_URL,
				headers: {
					cookie: request.headers.get('cookie') || '',
				},
			}
		)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check if user is admin or master
		if (session.user.role !== 'admin' && session.user.role !== 'master') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { id: orderId } = await params
		const body = await request.json()
		const { status } = body

		// Validate status
		const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED']
		if (!status || !validStatuses.includes(status)) {
			return NextResponse.json(
				{
					error:
						'Invalid status. Must be one of: PENDING, COMPLETED, CANCELLED',
				},
				{ status: 400 }
			)
		}

		// Get the current order to check the old status
		const currentOrder = await prisma.order.findUnique({
			where: { id: orderId },
			select: {
				status: true,
				userId: true,
			},
		})

		if (!currentOrder) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 })
		}

		// Update the order status
		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: { status },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				items: {
					include: {
						item: true,
					},
				},
			},
		})

		// Create notification if status actually changed
		if (currentOrder.status !== status) {
			try {
				await createOrderStatusNotification(
					currentOrder.userId,
					orderId,
					currentOrder.status as 'PENDING' | 'COMPLETED' | 'CANCELLED',
					status as 'PENDING' | 'COMPLETED' | 'CANCELLED'
				)
			} catch (notificationError) {
				console.error('Error creating notification:', notificationError)
				// Don't fail the order update if notification fails
			}
		}

		// Transform the data to match the expected format
		const transformedOrder = {
			id: updatedOrder.id,
			status:
				updatedOrder.status === 'CANCELLED' ? 'CANCELED' : updatedOrder.status,
			date: updatedOrder.createdAt.toLocaleString('pt-BR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			}),
			total: Number(updatedOrder.totalPrice),
			paymentMethod: updatedOrder.paymentMethod,
			user: {
				id: updatedOrder.user.id,
				name: updatedOrder.user.name,
				email: updatedOrder.user.email,
			},
			itemCount: updatedOrder.items.reduce(
				(total, item) => total + item.quantity,
				0
			),
			items: updatedOrder.items.map((orderItem) => ({
				name: orderItem.name,
				price: Number(orderItem.price),
				quantity: orderItem.quantity,
			})),
			rating: updatedOrder.rating,
			feedback: updatedOrder.feedback,
			feedbackAt: updatedOrder.feedbackAt?.toISOString(),
		}

		return NextResponse.json(transformedOrder)
	} catch (error) {
		console.error('Error updating order status:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
