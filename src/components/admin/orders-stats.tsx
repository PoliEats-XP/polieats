'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
	ShoppingCart,
	Clock,
	CheckCircle,
	XCircle,
	TrendingUp,
} from 'lucide-react'

interface OrderStats {
	total: number
	pending: number
	completed: number
	canceled: number
	totalRevenue: number
	averageOrderValue: number
}

async function fetchOrderStats(): Promise<OrderStats> {
	const response = await fetch('/api/admin/orders/stats')

	if (!response.ok) {
		throw new Error('Failed to fetch order stats')
	}

	return response.json()
}

export function OrdersStats() {
	const {
		data: stats,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['admin-order-stats'],
		queryFn: fetchOrderStats,
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-16 mb-1" />
							<Skeleton className="h-3 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (isError || !stats) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-destructive text-center">
						Erro ao carregar estatísticas
					</p>
				</CardContent>
			</Card>
		)
	}

	const statCards = [
		{
			title: 'Total de Pedidos',
			value: stats.total.toString(),
			description: 'Todos os pedidos',
			icon: ShoppingCart,
			color: 'text-blue-600',
		},
		{
			title: 'Em Andamento',
			value: stats.pending.toString(),
			description: 'Pedidos pendentes',
			icon: Clock,
			color: 'text-yellow-600',
		},
		{
			title: 'Concluídos',
			value: stats.completed.toString(),
			description: 'Pedidos finalizados',
			icon: CheckCircle,
			color: 'text-green-600',
		},
		{
			title: 'Cancelados',
			value: stats.canceled.toString(),
			description: 'Pedidos cancelados',
			icon: XCircle,
			color: 'text-red-600',
		},
		{
			title: 'Receita Total',
			value: `R$ ${stats.totalRevenue.toFixed(2)}`,
			description: 'Valor total arrecadado',
			icon: TrendingUp,
			color: 'text-emerald-600',
		},
		{
			title: 'Ticket Médio',
			value: `R$ ${stats.averageOrderValue.toFixed(2)}`,
			description: 'Valor médio por pedido',
			icon: TrendingUp,
			color: 'text-purple-600',
		},
	]

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
			{statCards.map((stat, index) => (
				<Card key={index}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
						<stat.icon className={`h-4 w-4 ${stat.color}`} />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stat.value}</div>
						<p className="text-xs text-muted-foreground">{stat.description}</p>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
