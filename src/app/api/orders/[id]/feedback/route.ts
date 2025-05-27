import { betterFetch } from '@better-fetch/fetch'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Session } from '@/lib/auth'

export async function POST(
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
		const { rating, feedback } = body

		// Validate rating
		if (!rating || rating < 1 || rating > 5) {
			return NextResponse.json(
				{ error: 'Rating must be between 1 and 5' },
				{ status: 400 }
			)
		}

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

		// Only allow feedback for completed orders
		if (order.status !== 'COMPLETED') {
			return NextResponse.json(
				{ error: 'Feedback can only be submitted for completed orders' },
				{ status: 400 }
			)
		}

		// Update the order with feedback
		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: {
				rating,
				feedback: feedback?.trim() || null,
				feedbackAt: new Date(),
			},
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
			item: updatedOrder.items.map((orderItem) => ({
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
		console.error('Error submitting feedback:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
