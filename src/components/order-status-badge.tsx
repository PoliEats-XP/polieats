import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	// let statusLabel
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	// biome-ignore lint/style/useSingleVarDeclarator: <explanation>
	let icon, statusLabel, borderColor

	switch (status) {
		case 'PENDING':
			icon = <Clock className="text-yellow-500" size={16} />
			statusLabel = <p className="text-yellow-500">Pendente</p>
			borderColor = 'border-yellow-500'
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
			className={cn('flex items-center gap-2', borderColor)}
		>
			{icon}
			{statusLabel}
		</Badge>
	)
}
