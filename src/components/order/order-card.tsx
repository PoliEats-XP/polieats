import { Card, CardDescription, CardFooter, CardHeader } from '../ui/card'
import { OrderStatusBadge } from './order-status-badge'
import { OrderDetails } from './order-details'
import { generateOrderNumber, formatOrderDateTime } from '@/lib/utils'
// Define the actual order structure being used
interface OrderItem {
	name: string
	price: number
	quantity: number
}

interface ActualOrder {
	id: string
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
	date: string
	total: number
	item: OrderItem[]
}

interface OrderCardProps {
	order: ActualOrder
}

export function OrderCard({ order }: OrderCardProps) {
	const orderNumber = generateOrderNumber(order.id)
	const formattedDateTime = formatOrderDateTime(order.date)

	return (
		<Card className="w-full h-52 flex flex-col justify-between">
			<div>
				<CardHeader className="flex justify-between items-center font-medium text-2xl">
					<p>Pedido #{orderNumber}</p>
					<OrderStatusBadge status={order.status} />
				</CardHeader>
				<CardDescription className="pl-6 -mt-1 font-light text-midgray">
					{formattedDateTime}
				</CardDescription>
			</div>
			<CardFooter className="flex justify-between items-center">
				<p>Valor total do pedido: R$ {order.total}</p>
				<OrderDetails order={order} />
			</CardFooter>
		</Card>
	)
}
