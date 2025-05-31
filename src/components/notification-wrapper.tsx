'use client'

import { useEffect, useState } from 'react'
import { betterFetch } from '@better-fetch/fetch'
import { NotificationProvider, useNotifications } from './notification-provider'
import { NotificationBell } from './ui/notification-bell'
import type { Session } from '@/lib/auth'
import type { ReactNode } from 'react'

interface NotificationWrapperProps {
	children: ReactNode
}

// This component uses the notification context from the root layout provider
export function NotificationBellWrapper() {
	const [isClient, setIsClient] = useState(false)

	// Call all hooks unconditionally at the top level
	let notifications: any[] = []
	let unreadCount = 0
	let markAsRead: (notificationIds: string[]) => Promise<void> = async () => {}
	let markAllAsRead: () => Promise<void> = async () => {}
	let hasProvider = false

	try {
		const notificationContext = useNotifications()
		notifications = notificationContext.notifications
		unreadCount = notificationContext.unreadCount
		markAsRead = notificationContext.markAsRead
		markAllAsRead = notificationContext.markAllAsRead
		hasProvider = true
	} catch (error) {
		// Provider not available (user not logged in or provider missing)
		hasProvider = false
	}

	// Ensure this only renders on the client to prevent hydration mismatches
	useEffect(() => {
		setIsClient(true)
	}, [])

	if (!isClient) {
		return <div className="w-6 h-6" /> // Placeholder to maintain layout during SSR
	}

	if (!hasProvider) {
		return <div className="w-6 h-6" /> // Placeholder when provider is not available
	}

	return (
		<NotificationBell
			notifications={notifications}
			unreadCount={unreadCount}
			onMarkAsRead={markAsRead}
			onMarkAllAsRead={markAllAsRead}
		/>
	)
}

export function NotificationWrapper({ children }: NotificationWrapperProps) {
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await betterFetch<Session>('/api/auth/get-session', {
					baseURL:
						process.env.NEXT_PUBLIC_BETTER_AUTH_URL || window.location.origin,
				})
				setSession(data)
			} catch (error) {
				console.error('Error fetching session:', error)
				setSession(null)
			} finally {
				setLoading(false)
			}
		}

		fetchSession()
	}, [])

	if (loading) {
		return <>{children}</>
	}

	return (
		<NotificationProvider userId={session?.user?.id}>
			{children}
		</NotificationProvider>
	)
}
