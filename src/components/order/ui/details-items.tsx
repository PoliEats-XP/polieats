import type { Order } from '@/types'

interface DetailsItemsProps {
	component: 'drawer' | 'dialog'
}

export function DetailsItems({ component, order }: DetailsItemsProps & Order) {
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
