import { StarRating } from '@/components/ui/star-rating'
import { Star } from 'lucide-react'

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
	rating?: number | null
	feedback?: string | null
	feedbackAt?: string | null
}

interface DetailsItemsProps {
	component: 'drawer' | 'dialog'
	order: ActualOrder
}

export function DetailsItems({ component, order }: DetailsItemsProps) {
	const hasFeedback = order.rating !== null && order.rating !== undefined

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

			{/* Feedback Section */}
			{hasFeedback && (
				<div
					className={`mt-4 p-3 bg-muted/50 rounded-md ${component === 'drawer' ? 'mb-2' : ''}`}
				>
					<div className="flex items-center gap-2 mb-2">
						<Star className="w-4 h-4 text-yellow-400" />
						<span className="text-sm font-medium">Sua avaliação:</span>
					</div>
					<StarRating rating={order.rating || 0} readonly size="sm" />
					{order.feedback && (
						<div className="mt-2">
							<p className="text-sm text-muted-foreground italic">
								"{order.feedback}"
							</p>
							{order.feedbackAt && (
								<p className="text-xs text-muted-foreground mt-1">
									Avaliado em{' '}
									{new Date(order.feedbackAt).toLocaleString('pt-BR')}
								</p>
							)}
						</div>
					)}
				</div>
			)}
		</>
	)
}
