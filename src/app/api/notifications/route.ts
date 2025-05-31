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
		const unreadOnly = searchParams.get('unreadOnly') === 'true'
		const limit = Number.parseInt(searchParams.get('limit') || '20')

		// Build where clause
		const where: any = {
			userId: session.user.id,
		}

		if (unreadOnly) {
			where.read = false
		}

		// Fetch notifications
		const notifications = await prisma.notification.findMany({
			where,
			include: {
				order: {
					select: {
						id: true,
						status: true,
						totalPrice: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit,
		})

		// Transform notifications for the response
		const transformedNotifications = notifications.map((notification) => ({
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
		}))

		return NextResponse.json({
			notifications: transformedNotifications,
		})
	} catch (error) {
		console.error('Error fetching notifications:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export async function PATCH(request: NextRequest) {
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

		const body = await request.json()
		const { notificationIds, markAsRead } = body

		if (!Array.isArray(notificationIds) || typeof markAsRead !== 'boolean') {
			return NextResponse.json(
				{ error: 'Invalid request body' },
				{ status: 400 }
			)
		}

		// Update notifications
		await prisma.notification.updateMany({
			where: {
				id: { in: notificationIds },
				userId: session.user.id, // Ensure user can only update their own notifications
			},
			data: {
				read: markAsRead,
			},
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error updating notifications:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
