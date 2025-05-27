'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	User,
	Calendar,
	CreditCard,
	Package,
	Wallet,
	Save,
	Star,
} from 'lucide-react'
import { toast } from 'sonner'
import type { AdminOrder } from '@/types/admin'
import { useOrderStats } from '@/hooks/use-order-stats'
import { StarRating } from '@/components/ui/star-rating'

interface OrderDetailsModalProps {
	orderId: string | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

async function fetchOrderDetails(orderId: string): Promise<AdminOrder> {
	const response = await fetch(`/api/admin/orders/${orderId}`)

	if (!response.ok) {
		throw new Error('Failed to fetch order details')
	}

	return response.json()
}

async function updateOrderStatus(
	orderId: string,
	status: string
): Promise<AdminOrder> {
	const response = await fetch(`/api/admin/orders/${orderId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ status }),
	})

	if (!response.ok) {
		throw new Error('Failed to update order status')
	}

	return response.json()
}

function getStatusBadgeVariant(status: string) {
	switch (status) {
		case 'PENDING':
			return 'default'
		case 'COMPLETED':
			return 'secondary'
		case 'CANCELED':
			return 'destructive'
		default:
			return 'outline'
	}
}

function getStatusLabel(status: string) {
	switch (status) {
		case 'PENDING':
			return 'Em andamento'
		case 'COMPLETED':
			return 'Concluído'
		case 'CANCELED':
			return 'Cancelado'
		default:
			return status
	}
}

function getPaymentMethodLabel(paymentMethod: string | null) {
	switch (paymentMethod) {
		case 'CASH':
			return 'Dinheiro'
		case 'CREDIT_CARD':
			return 'Cartão de Crédito'
		case 'DEBIT_CARD':
			return 'Cartão de Débito'
		case 'PIX':
			return 'PIX'
		case 'INDEFINIDO':
			return 'Indefinido'
		default:
			return 'Não informado'
	}
}

export function OrderDetailsModal({
	orderId,
	open,
	onOpenChange,
}: OrderDetailsModalProps) {
	const [selectedStatus, setSelectedStatus] = useState<string>('')
	const queryClient = useQueryClient()
	const { updateStatsOptimistically } = useOrderStats()

	const {
		data: order,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['admin-order-details', orderId],
		queryFn: () => fetchOrderDetails(orderId!),
		enabled: !!orderId && open,
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	const updateStatusMutation = useMutation({
		mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
			updateOrderStatus(orderId, status),
		onMutate: async ({ status: newStatus }) => {
			// Optimistic update for stats
			if (order) {
				const oldStatus =
					order.status === 'CANCELED' ? 'CANCELLED' : order.status
				updateStatsOptimistically(oldStatus, newStatus, order.total)
			}
		},
		onSuccess: (updatedOrder) => {
			// Update the order details cache
			queryClient.setQueryData(['admin-order-details', orderId], updatedOrder)
			// Invalidate the orders list to refresh it
			queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
			// Invalidate stats to ensure they're accurate
			queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] })
			toast.success('Status do pedido atualizado com sucesso!')
		},
		onError: (error) => {
			// Revert optimistic update on error
			queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] })
			toast.error(`Erro ao atualizar status: ${error.message}`)
		},
	})

	// Set initial status when order loads
	useEffect(() => {
		if (order?.status) {
			setSelectedStatus(
				order.status === 'CANCELED' ? 'CANCELLED' : order.status
			)
		}
	}, [order?.status])

	const handleStatusUpdate = () => {
		if (
			!orderId ||
			!selectedStatus ||
			selectedStatus ===
				(order?.status === 'CANCELED' ? 'CANCELLED' : order?.status)
		) {
			return
		}

		updateStatusMutation.mutate({ orderId, status: selectedStatus })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Detalhes do Pedido</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-24 w-full" />
					</div>
				) : isError ? (
					<div className="text-center py-8">
						<p className="text-destructive">
							Erro ao carregar detalhes: {error?.message}
						</p>
					</div>
				) : order ? (
					<div className="space-y-6">
						{/* Order Header */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span className="font-mono text-lg">#{order.id}</span>
									<Badge variant={getStatusBadgeVariant(order.status)}>
										{getStatusLabel(order.status)}
									</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="flex items-center space-x-2">
										<User className="w-4 h-4 text-muted-foreground" />
										<div>
											<p className="font-medium">{order.user.name}</p>
											<p className="text-sm text-muted-foreground">
												{order.user.email}
											</p>
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<Calendar className="w-4 h-4 text-muted-foreground" />
										<div>
											<p className="font-medium">Data do Pedido</p>
											<p className="text-sm text-muted-foreground">
												{order.date}
											</p>
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<Wallet className="w-4 h-4 text-muted-foreground" />
										<div>
											<p className="font-medium">Método de Pagamento</p>
											<p className="text-sm text-muted-foreground">
												{getPaymentMethodLabel(order.paymentMethod)}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Status Management */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Package className="w-5 h-5" />
									<span>Gerenciar Status</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center space-x-4">
									<div className="flex-1">
										<div className="text-sm font-medium mb-2">
											Atualizar Status do Pedido
										</div>
										<Select
											value={selectedStatus}
											onValueChange={setSelectedStatus}
										>
											<SelectTrigger>
												<SelectValue placeholder="Selecione um status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="PENDING">Em andamento</SelectItem>
												<SelectItem value="COMPLETED">Concluído</SelectItem>
												<SelectItem value="CANCELLED">Cancelado</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<Button
										onClick={handleStatusUpdate}
										disabled={
											updateStatusMutation.isPending ||
											!selectedStatus ||
											selectedStatus ===
												(order.status === 'CANCELED'
													? 'CANCELLED'
													: order.status)
										}
										className="mt-6"
									>
										{updateStatusMutation.isPending ? (
											<>
												<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
												Atualizando...
											</>
										) : (
											<>
												<Save className="w-4 h-4 mr-2" />
												Atualizar Status
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Order Items */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Package className="w-5 h-5" />
									<span>Itens do Pedido ({order.itemCount})</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{order.items.map((item, index) => (
										<div key={index}>
											<div className="flex justify-between items-center">
												<div>
													<p className="font-medium">{item.name}</p>
													<p className="text-sm text-muted-foreground">
														Quantidade: {item.quantity}
													</p>
												</div>
												<div className="text-right">
													<p className="font-medium">
														R$ {item.price.toFixed(2)}
													</p>
													<p className="text-sm text-muted-foreground">
														Subtotal: R${' '}
														{(item.price * item.quantity).toFixed(2)}
													</p>
												</div>
											</div>
											{index < order.items.length - 1 && (
												<Separator className="mt-3" />
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Order Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<CreditCard className="w-5 h-5" />
									<span>Resumo do Pedido</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Subtotal:</span>
										<span>R$ {order.total.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span>Taxa de entrega:</span>
										<span>R$ 0,00</span>
									</div>
									<Separator />
									<div className="flex justify-between font-bold text-lg">
										<span>Total:</span>
										<span>R$ {order.total.toFixed(2)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Customer Feedback */}
						{order.rating !== null && order.rating !== undefined && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<Star className="w-5 h-5" />
										<span>Avaliação do Cliente</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div>
											<p className="text-sm font-medium mb-2">Classificação:</p>
											<StarRating rating={order.rating} readonly size="md" />
										</div>
										{order.feedback && (
											<div>
												<p className="text-sm font-medium mb-2">Comentário:</p>
												<p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md">
													"{order.feedback}"
												</p>
											</div>
										)}
										{order.feedbackAt && (
											<div>
												<p className="text-xs text-muted-foreground">
													Avaliado em{' '}
													{new Date(order.feedbackAt).toLocaleString('pt-BR')}
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	)
}
