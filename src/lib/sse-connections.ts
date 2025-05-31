// Enhanced connection tracking with cleanup capabilities
interface Connection {
	controller: ReadableStreamDefaultController
	heartbeatInterval: NodeJS.Timeout
	isActive: boolean
}

// Global Map to store active SSE connections
const connections = new Map<string, Connection>()

// Helper function to clean up connections
function cleanupConnection(userId: string) {
	const connection = connections.get(userId)
	if (connection) {
		connection.isActive = false
		clearInterval(connection.heartbeatInterval)
		try {
			connection.controller.close()
		} catch (error) {
			// Controller might already be closed, that's okay
		}
		connections.delete(userId)
	}
}

// Function to send notification to a specific user
function sendNotificationToUser(userId: string, notification: any) {
	const connection = connections.get(userId)
	if (connection?.isActive) {
		try {
			const data = JSON.stringify({
				type: 'notification',
				data: notification,
				timestamp: new Date().toISOString(),
			})
			connection.controller.enqueue(`data: ${data}\n\n`)
		} catch (error) {
			console.error('Error sending notification to user:', error)
			// Clean up invalid connection
			cleanupConnection(userId)
		}
	}
}

export {
	connections,
	cleanupConnection,
	sendNotificationToUser,
	type Connection,
}
