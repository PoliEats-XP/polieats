interface DetailsItemsProps {
	order: {
		id: string
		status: 'PENDING' | 'COMPLETED' | 'CANCELED'
		date: string
		total: number
		items: { name: string; price: number; quantity: number }[]
	}
	component: 'drawer' | 'dialog'
}

export function DetailsItems({ order, component }: DetailsItemsProps) {
	return (
		<>
			{order.items.map((item, index) => (
				<div
					key={index}
					className={`flex items-center justify-between p-2 border rounded-md ${component === 'drawer' ? 'mb-2' : ''}`}
				>
					<p>
						{item.name} - R${item.price}
					</p>
					<p>{item.quantity}</p>
				</div>
			))}
		</>
	)
}
