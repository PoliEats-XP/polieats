'use client'

import * as React from 'react'
import { Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

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

interface NotificationBellProps {
	notifications: Notification[]
	unreadCount: number
	onMarkAsRead: (notificationIds: string[]) => void
	onMarkAllAsRead: () => void
	className?: string
}

export function NotificationBell({
	notifications,
	unreadCount,
	onMarkAsRead,
	onMarkAllAsRead,
	className,
}: NotificationBellProps) {
	const [isOpen, setIsOpen] = React.useState(false)

	const formatTime = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60)
		)

		if (diffInMinutes < 1) return 'Agora'
		if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
		return `${Math.floor(diffInMinutes / 1440)}d atrás`
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return 'text-green-600 bg-green-50'
			case 'CANCELLED':
				return 'text-red-600 bg-red-50'
			case 'PENDING':
				return 'text-yellow-600 bg-yellow-50'
			default:
				return 'text-gray-600 bg-gray-50'
		}
	}

	const getStatusText = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return 'Finalizado'
			case 'CANCELLED':
				return 'Cancelado'
			case 'PENDING':
				return 'Preparando'
			default:
				return status
		}
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn('relative', className)}
				>
					<Bell className="h-5 w-5" />
					<AnimatePresence>
						{unreadCount > 0 && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								exit={{ scale: 0 }}
								className="absolute -top-1 -right-1"
							>
								<Badge
									variant="destructive"
									className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
								>
									{unreadCount > 99 ? '99+' : unreadCount}
								</Badge>
							</motion.div>
						)}
					</AnimatePresence>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<div className="flex items-center justify-between p-2">
					<DropdownMenuLabel className="font-semibold">
						Notificações
					</DropdownMenuLabel>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onMarkAllAsRead}
							className="text-xs h-auto p-1"
						>
							Marcar todas como lidas
						</Button>
					)}
				</div>
				<DropdownMenuSeparator />
				<div className="max-h-80 overflow-y-auto">
					{notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
							<Bell className="h-8 w-8 mb-2 opacity-50" />
							<p className="text-sm">Nenhuma notificação</p>
						</div>
					) : (
						<div className="space-y-1">
							{notifications.map((notification) => (
								<DropdownMenuItem
									key={notification.id}
									className={cn(
										'flex flex-col items-start space-y-2 p-3 cursor-pointer',
										!notification.read && 'bg-blue-50 dark:bg-blue-950/50'
									)}
									onClick={() => {
										if (!notification.read) {
											onMarkAsRead([notification.id])
										}
									}}
								>
									<div className="flex items-center justify-between w-full">
										<div className="flex items-center space-x-2">
											<div
												className={cn(
													'w-2 h-2 rounded-full',
													notification.read ? 'bg-gray-300' : 'bg-blue-500'
												)}
											/>
											<span className="font-medium text-sm">
												{notification.title}
											</span>
										</div>
										<span className="text-xs text-muted-foreground">
											{formatTime(notification.createdAt)}
										</span>
									</div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{notification.message}
									</p>
									{notification.order && (
										<div className="flex items-center justify-between w-full pt-1">
											<span className="text-xs text-muted-foreground">
												Pedido #{notification.order.id.slice(0, 8)}
											</span>
											<Badge
												variant="outline"
												className={cn(
													'text-xs',
													getStatusColor(notification.order.status)
												)}
											>
												{getStatusText(notification.order.status)}
											</Badge>
										</div>
									)}
								</DropdownMenuItem>
							))}
						</div>
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
