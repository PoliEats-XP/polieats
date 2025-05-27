'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/ui/star-rating'
import { toast } from 'sonner'
import { MessageSquare, Send } from 'lucide-react'

interface FeedbackModalProps {
	orderId: string
	open: boolean
	onOpenChange: (open: boolean) => void
	currentRating?: number | null
	currentFeedback?: string | null
}

async function submitFeedback({
	orderId,
	rating,
	feedback,
}: {
	orderId: string
	rating: number
	feedback?: string
}) {
	const response = await fetch(`/api/orders/${orderId}/feedback`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ rating, feedback }),
	})

	if (!response.ok) {
		throw new Error('Failed to submit feedback')
	}

	return response.json()
}

export function FeedbackModal({
	orderId,
	open,
	onOpenChange,
	currentRating = null,
	currentFeedback = null,
}: FeedbackModalProps) {
	const [rating, setRating] = useState(currentRating || 0)
	const [feedback, setFeedback] = useState(currentFeedback || '')
	const queryClient = useQueryClient()

	const feedbackMutation = useMutation({
		mutationFn: submitFeedback,
		onSuccess: () => {
			toast.success('Avaliação enviada com sucesso!')
			queryClient.invalidateQueries({ queryKey: ['orders'] })
			onOpenChange(false)
		},
		onError: (error) => {
			toast.error(`Erro ao enviar avaliação: ${error.message}`)
		},
	})

	const handleSubmit = () => {
		if (rating === 0) {
			toast.error('Por favor, selecione uma avaliação de 1 a 5 estrelas')
			return
		}

		feedbackMutation.mutate({
			orderId,
			rating,
			feedback: feedback.trim() || undefined,
		})
	}

	const isEditing = currentRating !== null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MessageSquare className="w-5 h-5" />
						{isEditing ? 'Editar Avaliação' : 'Avaliar Pedido'}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Rating Section */}
					<div className="space-y-3">
						<div>
							<h3 className="text-sm font-medium mb-2">
								Como foi sua experiência?
							</h3>
							<StarRating
								rating={rating}
								onRatingChange={setRating}
								size="lg"
								showLabel
								className="justify-center"
							/>
						</div>
					</div>

					{/* Feedback Section */}
					<div className="space-y-3">
						<label htmlFor="feedback" className="text-sm font-medium">
							Comentário (opcional)
						</label>
						<Textarea
							id="feedback"
							placeholder="Conte-nos mais sobre sua experiência..."
							value={feedback}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setFeedback(e.target.value)
							}
							rows={4}
							maxLength={500}
						/>
						<p className="text-xs text-muted-foreground text-right">
							{feedback.length}/500 caracteres
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1"
							disabled={feedbackMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={rating === 0 || feedbackMutation.isPending}
							className="flex-1"
						>
							{feedbackMutation.isPending ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
									Enviando...
								</>
							) : (
								<>
									<Send className="w-4 h-4 mr-2" />
									{isEditing ? 'Atualizar' : 'Enviar'}
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
