import { Card, CardDescription, CardFooter, CardHeader } from './ui/card'
import { OrderStatusBadge } from './order-status-badge'
// import { OrderDetailsDialog } from './order-details-dialog'
import { OrderDetails } from './order-details'

interface OrderCardProps {
	order: {
		id: string
		status: 'PENDING' | 'COMPLETED' | 'CANCELED'
		date: string
		total: number
		items: { name: string; price: number; quantity: number }[]
	}
}

export function OrderCard({ order }: OrderCardProps) {
	return (
		<Card className="w-[32rem] h-52 flex flex-col justify-between">
			<div>
				<CardHeader className="flex justify-between items-center font-medium text-2xl">
					<p>Pedido {order.id}</p>
					{/* Order Status Badge */}
					<OrderStatusBadge status={order.status} />
				</CardHeader>
				<CardDescription className="pl-6 -mt-1 font-light text-[#7d7d7d]">
					{order.date}
				</CardDescription>
			</div>
			<CardFooter className="flex justify-between items-center">
				<p>Valor total do pedido: R$ {order.total}</p>
				{/* <OrderDetailsDialog order={order} /> */}
				<OrderDetails order={order} />
			</CardFooter>
			{/* Check details dialog */}
		</Card>
	)
}
