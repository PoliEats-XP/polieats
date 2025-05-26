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

interface DetailsItemsProps {
	component: 'drawer' | 'dialog'
	order: ActualOrder
}

export function DetailsItems({ component, order }: DetailsItemsProps) {
	return (
		<>
			{order.item.map((item: OrderItem, index: number) => (
				<div
					key={index}
					className={`flex items-center justify-between p-2 border rounded-md ${component === 'drawer' ? 'mb-2' : ''}`}
				>
					<div className="flex flex-col">
						<p className="font-medium">{item.name}</p>
						<p className="text-sm text-muted-foreground">
							R$ {item.price.toFixed(2)} cada
						</p>
					</div>
					<div className="text-right">
						<p className="font-medium">Qtd: {item.quantity}</p>
						<p className="text-sm text-muted-foreground">
							Total: R$ {(item.price * item.quantity).toFixed(2)}
						</p>
					</div>
				</div>
			))}
		</>
	)
}
