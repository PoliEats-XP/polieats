import { Card, CardDescription, CardFooter, CardHeader } from './ui/card'

interface OrderCardProps {
	order: {
		id: string
		date: string
		total: number
		items: { name: string; quantity: number }[]
	}
}

export function OrderCard({ order }: OrderCardProps) {
	return (
		<Card className="w-[32rem] h-52 flex flex-col justify-between">
			<div>
				<CardHeader className="flex justify-between items-center font-medium text-2xl">
					<p>Pedido {order.id}</p>
					{/* Order Status Badge */}
				</CardHeader>
				<CardDescription className="pl-6 -mt-1 font-light text-[#7d7d7d]">
					{order.date}
				</CardDescription>
			</div>
			<CardFooter className="flex justify-between items-center">
				<p>Valor total do pedido: R$ {order.total}</p>
			</CardFooter>
			{/* Check details dialog */}
		</Card>
	)
}
