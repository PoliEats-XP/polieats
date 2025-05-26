import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'

interface AdminOrderStatusBadgeProps {
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
	className?: string
}

export function AdminOrderStatusBadge({
	status,
	className,
}: AdminOrderStatusBadgeProps) {
	let icon, statusLabel, badgeColor

	switch (status) {
		case 'PENDING':
			icon = <Clock className="w-3 h-3" />
			statusLabel = 'Em andamento'
			badgeColor =
				'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
			break
		case 'COMPLETED':
			icon = <CheckCircle className="w-3 h-3" />
			statusLabel = 'Concluído'
			badgeColor =
				'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
			break
		case 'CANCELED':
			icon = <XCircle className="w-3 h-3" />
			statusLabel = 'Cancelado'
			badgeColor = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
			break
		default:
			icon = null
			statusLabel = status
			badgeColor = 'bg-gray-100 text-gray-800 border-gray-200'
			break
	}

	return (
		<Badge
			variant="outline"
			className={cn(
				'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors',
				badgeColor,
				className
			)}
		>
			{icon}
			{statusLabel}
		</Badge>
	)
}
