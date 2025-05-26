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

		// Check if user is admin or master
		if (session.user.role !== 'admin' && session.user.role !== 'master') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const page = Number.parseInt(searchParams.get('page') || '1')
		const limit = Number.parseInt(searchParams.get('limit') || '10')
		const search = searchParams.get('search') || ''
		const status = searchParams.get('status') || ''
		const offset = (page - 1) * limit

		// Build where clause for filtering
		const where: any = {}

		// Add search filter (search by order ID or user name/email)
		if (search) {
			where.OR = [
				{ id: { contains: search, mode: 'insensitive' } },
				{ user: { name: { contains: search, mode: 'insensitive' } } },
				{ user: { email: { contains: search, mode: 'insensitive' } } },
			]
		}

		// Add status filter
		if (status && status !== 'ALL') {
			where.status = status
		}

		// Fetch orders with pagination and filters
		const orders = await prisma.order.findMany({
			where,
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
			orderBy: {
				createdAt: 'desc',
			},
			skip: offset,
			take: limit,
		})

		// Get total count for pagination info
		const totalOrders = await prisma.order.count({ where })

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
			user: {
				id: order.user.id,
				name: order.user.name,
				email: order.user.email,
			},
			itemCount: order.items.length,
			items: order.items.map((orderItem) => ({
				name: orderItem.name,
				price: Number(orderItem.price),
				quantity: orderItem.quantity,
			})),
		}))

		const hasMore = offset + orders.length < totalOrders
		const totalPages = Math.ceil(totalOrders / limit)

		return NextResponse.json({
			orders: transformedOrders,
			pagination: {
				page,
				limit,
				total: totalOrders,
				totalPages,
				hasMore,
			},
		})
	} catch (error) {
		console.error('Error fetching admin orders:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
