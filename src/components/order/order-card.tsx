import { Card, CardDescription, CardFooter, CardHeader } from '../ui/card'
import { OrderStatusBadge } from './order-status-badge'
import { OrderDetails } from './order-details'
import type { Order } from '@/types'

export function OrderCard({ order }: Order) {
	return (
		<Card className="w-[32rem] h-52 flex flex-col justify-between">
			<div>
				<CardHeader className="flex justify-between items-center font-medium text-2xl">
					<p>Pedido {order.id}</p>
					<OrderStatusBadge status={order.status} />
				</CardHeader>
				<CardDescription className="pl-6 -mt-1 font-light text-[#7d7d7d]">
					{order.date}
				</CardDescription>
			</div>
			<CardFooter className="flex justify-between items-center">
				<p>Valor total do pedido: R$ {order.total}</p>
				<OrderDetails order={order} />
			</CardFooter>
		</Card>
	)
}
