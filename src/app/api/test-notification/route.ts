import { betterFetch } from '@better-fetch/fetch'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Session } from '@/lib/auth'
import { createNotification } from '@/service/notification'

export async function POST(request: NextRequest) {
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

		// Create a test notification
		await createNotification({
			userId: session.user.id,
			title: 'Teste de Notificação',
			message:
				'Esta é uma notificação de teste para verificar se o sistema está funcionando!',
			type: 'GENERAL',
		})

		return NextResponse.json({
			success: true,
			message: 'Test notification sent!',
		})
	} catch (error) {
		console.error('Error creating test notification:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
