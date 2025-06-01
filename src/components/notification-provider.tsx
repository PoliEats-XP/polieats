'use client'

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface Notification {
	id: string
	title: string
	message: string
	type: 'ORDER_UPDATE' | 'GENERAL'
	read: boolean
	createdAt: string
	order?: {
		id: string
		status: string
		totalPrice: number
	} | null
}

interface NotificationContextType {
	notifications: Notification[]
	unreadCount: number
	markAsRead: (notificationIds: string[]) => Promise<void>
	markAllAsRead: () => Promise<void>
	clearAllNotifications: () => Promise<void>
	refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
)

export function useNotifications() {
	const context = useContext(NotificationContext)
	if (context === undefined) {
		throw new Error(
			'useNotifications must be used within a NotificationProvider'
		)
	}
	return context
}

interface NotificationProviderProps {
	children: ReactNode
	userId?: string
}

export function NotificationProvider({
	children,
	userId,
}: NotificationProviderProps) {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const queryClient = useQueryClient()

	// Fetch notifications from API
	const fetchNotifications = useCallback(async () => {
		if (!userId) return

		try {
			const response = await fetch('/api/notifications')
			if (response.ok) {
				const data = await response.json()
				setNotifications(data.notifications)
				setUnreadCount(
					data.notifications.filter((n: Notification) => !n.read).length
				)
			}
		} catch (error) {
			console.error('Error fetching notifications:', error)
		}
	}, [userId])

	// Mark notifications as read
	const markAsRead = useCallback(async (notificationIds: string[]) => {
		try {
			const response = await fetch('/api/notifications', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					notificationIds,
					markAsRead: true,
				}),
			})

			if (response.ok) {
				setNotifications((prev) =>
					prev.map((notification) =>
						notificationIds.includes(notification.id)
							? { ...notification, read: true }
							: notification
					)
				)
				setUnreadCount((prev) => Math.max(0, prev - notificationIds.length))
			}
		} catch (error) {
			console.error('Error marking notifications as read:', error)
		}
	}, [])

	// Mark all notifications as read
	const markAllAsRead = useCallback(async () => {
		const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
		if (unreadIds.length > 0) {
			await markAsRead(unreadIds)
		}
	}, [notifications, markAsRead])

	// Clear all notifications
	const clearAllNotifications = useCallback(async () => {
		try {
			const response = await fetch('/api/notifications', {
				method: 'DELETE',
			})

			if (response.ok) {
				setNotifications([])
				setUnreadCount(0)
			}
		} catch (error) {
			console.error('Error clearing notifications:', error)
		}
	}, [])

	// Set up SSE connection for real-time notifications
	useEffect(() => {
		if (!userId) return

		let eventSource: EventSource | null = null
		let reconnectTimeout: NodeJS.Timeout | null = null
		let isConnecting = false
		let reconnectAttempts = 0
		let isMounted = true // Track if component is still mounted
		const maxReconnectAttempts = 3 // Reduced max attempts to prevent long loops

		const cleanup = () => {
			isMounted = false
			if (eventSource) {
				eventSource.close()
				eventSource = null
			}
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout)
				reconnectTimeout = null
			}
			isConnecting = false
		}

		const connectSSE = () => {
			// Don't connect if component is unmounted or already connecting
			if (
				!isMounted ||
				isConnecting ||
				eventSource?.readyState === EventSource.OPEN
			) {
				return
			}

			isConnecting = true

			try {
				eventSource = new EventSource('/api/notifications/stream')

				eventSource.onopen = () => {
					console.log('Connected to notification stream')
					isConnecting = false
					reconnectAttempts = 0 // Reset attempts on successful connection
				}

				eventSource.onmessage = (event) => {
					if (!isMounted) return // Don't process messages if unmounted

					try {
						const data = JSON.parse(event.data)

						if (data.type === 'notification') {
							const newNotification = data.data

							// Add notification to state
							setNotifications((prev) => [newNotification, ...prev])
							setUnreadCount((prev) => prev + 1)

							// Show toast notification
							toast(newNotification.title, {
								description: newNotification.message,
								duration: 5000,
							})

							// If this is an order update notification, update the orders cache
							if (
								newNotification.type === 'ORDER_UPDATE' &&
								newNotification.order
							) {
								queryClient.setQueryData(['orders'], (oldData: any) => {
									if (!oldData) return oldData

									// Update the order in all pages
									const updatedPages = oldData.pages.map((page: any) => ({
										...page,
										orders: page.orders.map((order: any) => {
											if (order.id === newNotification.order.id) {
												return {
													...order,
													status: newNotification.order.status,
													total: newNotification.order.totalPrice,
												}
											}
											return order
										}),
									}))

									return {
										...oldData,
										pages: updatedPages,
									}
								})
							}
						} else if (data.type === 'heartbeat') {
							// Silent heartbeat, just keep the connection alive
							console.debug('Heartbeat received')
						}
					} catch (error) {
						console.error('Error parsing SSE message:', error)
					}
				}

				eventSource.onerror = (error) => {
					console.error('SSE connection error:', {
						readyState: eventSource?.readyState,
						url: eventSource?.url,
						userId: userId,
						isMounted: isMounted,
					})

					isConnecting = false

					// Close the current connection
					if (eventSource) {
						eventSource.close()
						eventSource = null
					}

					// Only reconnect if component is still mounted and we haven't exceeded max attempts
					if (isMounted && reconnectAttempts < maxReconnectAttempts) {
						reconnectAttempts++
						const delay = Math.min(1000 * 2 ** (reconnectAttempts - 1), 10000) // Reduced max delay to 10s

						console.log(
							`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`
						)

						reconnectTimeout = setTimeout(() => {
							if (isMounted) {
								// Double-check before reconnecting
								reconnectTimeout = null
								connectSSE()
							}
						}, delay)
					} else {
						if (isMounted) {
							console.warn(
								'Max reconnection attempts reached or component unmounted. SSE connection stopped.'
							)
						}
					}
				}
			} catch (error) {
				console.error('Error creating SSE connection:', error)
				isConnecting = false
			}
		}

		// Initial fetch
		fetchNotifications()

		// Connect to SSE
		connectSSE()

		return cleanup
	}, [userId, fetchNotifications, queryClient])

	const value: NotificationContextType = {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		clearAllNotifications,
		refreshNotifications: fetchNotifications,
	}

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	)
}
