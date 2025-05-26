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

		// Get total orders count
		const totalOrders = await prisma.order.count()

		// Get orders by status
		const [pendingOrders, completedOrders, canceledOrders] = await Promise.all([
			prisma.order.count({ where: { status: 'PENDING' } }),
			prisma.order.count({ where: { status: 'COMPLETED' } }),
			prisma.order.count({ where: { status: 'CANCELLED' } }),
		])

		// Get total revenue (only from completed orders)
		const revenueResult = await prisma.order.aggregate({
			where: { status: 'COMPLETED' },
			_sum: { totalPrice: true },
		})

		const totalRevenue = Number(revenueResult._sum.totalPrice || 0)

		// Calculate average order value
		const averageOrderValue =
			completedOrders > 0 ? totalRevenue / completedOrders : 0

		const stats = {
			total: totalOrders,
			pending: pendingOrders,
			completed: completedOrders,
			canceled: canceledOrders,
			totalRevenue,
			averageOrderValue,
		}

		return NextResponse.json(stats)
	} catch (error) {
		console.error('Error fetching order stats:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
