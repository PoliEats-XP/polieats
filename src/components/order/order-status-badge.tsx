import { CheckCircle, ChefHat, Clock, XCircle } from 'lucide-react'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
	className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
	let icon, statusLabel, borderColor

	switch (status) {
		case 'PENDING':
			icon = <ChefHat className="text-blue-500" size={16} />
			statusLabel = <p className="text-blue-500">Em preparo</p>
			borderColor = 'border-blue-500'
			break
		case 'COMPLETED':
			icon = <CheckCircle className="text-green-500" size={16} />
			statusLabel = <p className="text-green-500">Concluído</p>
			borderColor = 'border-green-500'
			break
		case 'CANCELED':
			icon = <XCircle className="text-red-500" size={16} />
			statusLabel = <p className="text-red-500">Cancelado</p>
			borderColor = 'border-red-500'
			break
		default:
			icon = null
			break
	}

	return (
		<Badge
			variant="outline"
			className={cn('flex items-center gap-2', borderColor, className)}
		>
			{icon}
			{statusLabel}
		</Badge>
	)
}
