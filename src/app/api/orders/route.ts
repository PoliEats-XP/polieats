import { betterFetch } from '@better-fetch/fetch'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Session } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

		const { searchParams } = new URL(request.url)
		const page = Number.parseInt(searchParams.get('page') || '1')
		const limit = Number.parseInt(searchParams.get('limit') || '10')
		const offset = (page - 1) * limit

		// Fetch orders with pagination
		const orders = await prisma.order.findMany({
			where: {
				userId: session.user.id,
			},
			include: {
				items: {
					include: {
						item: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip: offset,
			take: limit,
		})

		// Get total count for pagination info
		const totalOrders = await prisma.order.count({
			where: {
				userId: session.user.id,
			},
		})

		// Transform the data to match the expected format
		const transformedOrders = orders.map((order) => ({
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
			item: order.items.map((orderItem) => ({
				name: orderItem.name,
				price: Number(orderItem.price),
				quantity: orderItem.quantity,
			})),
		}))

		const hasMore = offset + orders.length < totalOrders

		return NextResponse.json({
			orders: transformedOrders,
			pagination: {
				page,
				limit,
				total: totalOrders,
				hasMore,
			},
		})
	} catch (error) {
		console.error('Error fetching orders:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
