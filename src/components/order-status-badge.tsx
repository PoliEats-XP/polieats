import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Badge } from './ui/badge'

interface OrderStatusBadgeProps {
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let statusLabel
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let icon

	switch (status) {
		case 'PENDING':
			icon = <Clock className="text-yellow-500" size={16} />
			statusLabel = <p className="text-yellow-500">Pendente</p>
			break
		case 'COMPLETED':
			icon = <CheckCircle className="text-green-500" size={16} />
			statusLabel = <p className="text-green-500">Concluído</p>
			break
		case 'CANCELED':
			icon = <XCircle className="text-red-500" size={16} />
			statusLabel = <p className="text-red-500">Cancelado</p>
			break
		default:
			icon = null
			break
	}

	return (
		<Badge variant="outline" className="flex items-center gap-2">
			{icon}
			{statusLabel}
		</Badge>
	)
}
