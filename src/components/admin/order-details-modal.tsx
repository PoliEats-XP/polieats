'use client'

import { useQuery } from '@tanstack/react-query'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { User, Calendar, CreditCard, Package } from 'lucide-react'
import type { AdminOrder } from '@/types/admin'

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

export function OrderDetailsModal({
	orderId,
	open,
	onOpenChange,
}: OrderDetailsModalProps) {
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
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	)
}
