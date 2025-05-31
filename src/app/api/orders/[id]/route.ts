import { betterFetch } from '@better-fetch/fetch'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Session } from '@/lib/auth'

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

		const { id: orderId } = await params
		const body = await request.json()
		const { action } = body

		// Check if order exists and belongs to the user
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: { userId: true, status: true },
		})

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 })
		}

		if (order.userId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		// Only allow canceling PENDING orders
		if (action === 'cancel') {
			if (order.status !== 'PENDING') {
				return NextResponse.json(
					{ error: 'Only pending orders can be canceled' },
					{ status: 400 }
				)
			}

			// Update the order status to CANCELLED
			const updatedOrder = await prisma.order.update({
				where: { id: orderId },
				data: { status: 'CANCELLED' },
				include: {
					items: {
						include: {
							item: true,
						},
					},
				},
			})

			// Transform the response to match the expected format
			const transformedOrder = {
				id: updatedOrder.id,
				status: 'CANCELED', // Convert CANCELLED to CANCELED for frontend
				date: updatedOrder.createdAt.toLocaleString('pt-BR', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					hour12: false,
				}),
				total: Number(updatedOrder.totalPrice),
				item: updatedOrder.items.map((orderItem) => ({
					name: orderItem.name,
					price: Number(orderItem.price),
					quantity: orderItem.quantity,
				})),
				rating: updatedOrder.rating,
				feedback: updatedOrder.feedback,
				feedbackAt: updatedOrder.feedbackAt?.toISOString(),
				paymentMethod: updatedOrder.paymentMethod,
			}

			return NextResponse.json(transformedOrder)
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
	} catch (error) {
		console.error('Error updating order:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
