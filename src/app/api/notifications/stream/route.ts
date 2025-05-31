import { betterFetch } from '@better-fetch/fetch'
import type { NextRequest } from 'next/server'
import type { Session } from '@/lib/auth'
import {
	connections,
	cleanupConnection,
	type Connection,
} from '@/lib/sse-connections'

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
			return new Response('Unauthorized', { status: 401 })
		}

		const userId = session.user.id

		// Clean up any existing connection for this user
		const existingConnection = connections.get(userId)
		if (existingConnection) {
			existingConnection.isActive = false
			clearInterval(existingConnection.heartbeatInterval)
			try {
				existingConnection.controller.close()
			} catch (error) {
				// Controller might already be closed
			}
			connections.delete(userId)
		}

		// Create a readable stream for SSE
		const stream = new ReadableStream({
			start(controller) {
				// Set up heartbeat interval
				const heartbeatInterval = setInterval(() => {
					const connection = connections.get(userId)
					if (!connection || !connection.isActive) {
						clearInterval(heartbeatInterval)
						return
					}

					try {
						controller.enqueue(
							`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`
						)
					} catch (error) {
						console.error('Heartbeat error:', error)
						// Clean up this connection
						cleanupConnection(userId)
					}
				}, 30000) // Send heartbeat every 30 seconds

				// Store the connection with all its data
				const connection: Connection = {
					controller,
					heartbeatInterval,
					isActive: true,
				}
				connections.set(userId, connection)

				// Send initial connection message
				try {
					const data = JSON.stringify({
						type: 'connection',
						message: 'Connected to notification stream',
						timestamp: new Date().toISOString(),
					})
					controller.enqueue(`data: ${data}\n\n`)
				} catch (error) {
					console.error('Error sending initial message:', error)
					cleanupConnection(userId)
				}
			},
			cancel() {
				cleanupConnection(userId)
			},
		})

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Cache-Control',
			},
		})
	} catch (error) {
		console.error('Error in notification stream:', error)
		return new Response('Internal server error', { status: 500 })
	}
}
