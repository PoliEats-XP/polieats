import { useState } from 'react'
import { Card, CardDescription, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { OrderStatusBadge } from './order-status-badge'
import { OrderDetails } from './order-details'
import { StarRating } from '../ui/star-rating'
import { FeedbackModal } from './feedback-modal'
import { generateOrderNumber, formatOrderDateTime } from '@/lib/utils'
import { MessageSquare, Star } from 'lucide-react'
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

interface OrderCardProps {
	order: ActualOrder
}

export function OrderCard({ order }: OrderCardProps) {
	const orderNumber = generateOrderNumber(order.id)
	const formattedDateTime = formatOrderDateTime(order.date)
	const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)

	// Allow feedback for all order statuses, not just completed ones
	const canLeaveFeedback = true
	const hasFeedback = order.rating !== null && order.rating !== undefined

	return (
		<>
			<Card className="w-full min-h-52 flex flex-col justify-between">
				<div>
					<CardHeader className="flex justify-between items-center font-medium text-2xl">
						<p>Pedido #{orderNumber}</p>
						<OrderStatusBadge status={order.status} />
					</CardHeader>
					<CardDescription className="pl-6 -mt-1 font-light text-midgray">
						{formattedDateTime}
					</CardDescription>

					{/* Feedback Display */}
					{hasFeedback && (
						<div className="px-6 py-2">
							<div className="flex items-center gap-2 mb-1">
								<Star className="w-4 h-4 text-yellow-400" />
								<span className="text-sm font-medium">Sua avaliação:</span>
							</div>
							<StarRating rating={order.rating || 0} readonly size="sm" />
							{order.feedback && (
								<p className="text-sm text-muted-foreground mt-1 italic">
									"{order.feedback}"
								</p>
							)}
						</div>
					)}
				</div>
				<CardFooter className="flex justify-between items-center">
					<p>Valor total do pedido: R$ {order.total}</p>
					<div className="flex gap-2">
						{canLeaveFeedback && (
							<Button
								variant="outline"
								onClick={() => setIsFeedbackModalOpen(true)}
								className="flex items-center gap-1"
							>
								<MessageSquare className="w-4 h-4" />
								{hasFeedback ? 'Editar Avaliação' : 'Avaliar'}
							</Button>
						)}
						<OrderDetails order={order} />
					</div>
				</CardFooter>
			</Card>

			{/* Feedback Modal */}
			<FeedbackModal
				orderId={order.id}
				open={isFeedbackModalOpen}
				onOpenChange={setIsFeedbackModalOpen}
				currentRating={order.rating}
				currentFeedback={order.feedback}
			/>
		</>
	)
}
