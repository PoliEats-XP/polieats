import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface OrderStatusBadgeProps {
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	const statusLabel =
		status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let icon

	switch (status) {
		case 'PENDING':
			icon = <Clock className="text-yellow-500" size={16} />
			break
		case 'COMPLETED':
			icon = <CheckCircle className="text-green-500" size={16} />
			break
		case 'CANCELED':
			icon = <XCircle className="text-red-500" size={16} />
			break
		default:
			icon = null
			break
	}

	return (
		<div className="flex items-center gap-2">
			{icon}
			{statusLabel}
		</div>
	)
}
