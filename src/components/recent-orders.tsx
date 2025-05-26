'use client'

import { useCallback } from 'react'
import { OrderCard } from '@/components/order/order-card'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks'

interface OrderItem {
	name: string
	price: number
	quantity: number
}

interface Order {
	id: string
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
	date: string
	total: number
	item: OrderItem[]
}

interface OrdersResponse {
	orders: Order[]
	pagination: {
		page: number
		limit: number
		total: number
		hasMore: boolean
	}
}

async function fetchOrders({
	pageParam = 1,
}: { pageParam: number }): Promise<OrdersResponse> {
	const response = await fetch(`/api/orders?page=${pageParam}&limit=10`)

	if (!response.ok) {
		throw new Error('Failed to fetch orders')
	}

	return response.json()
}

export function RecentOrders() {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		refetch,
	} = useInfiniteQuery({
		queryKey: ['orders'],
		queryFn: fetchOrders,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.hasMore
				? lastPage.pagination.page + 1
				: undefined
		},
		initialPageParam: 1,
		staleTime: 1000 * 60 * 2, // 2 minutes
	})

	const loadMoreOrders = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage])

	const [lastElementRef] = useInfiniteScroll(
		loadMoreOrders,
		hasNextPage && !isFetchingNextPage
	)

	// Flatten all pages, filter out orders with total price of 0 for security, and ensure orders are sorted by newest to oldest
	const allOrders = data?.pages.flatMap((page) => page.orders) ?? []
	const filteredOrders = allOrders.filter((order) => order.total > 0) // Security: exclude orders with total price of 0
	const sortedOrders = filteredOrders.sort((a, b) => {
		// Convert date strings to Date objects for proper comparison
		// Handle both DD/MM/YYYY HH:mm and DD/MM/YYYY formats
		const parseDate = (dateStr: string) => {
			if (dateStr.includes(' ')) {
				// Format: DD/MM/YYYY HH:mm
				const [datePart, timePart] = dateStr.split(' ')
				const [day, month, year] = datePart.split('/')
				const [hour, minute] = timePart.split(':')
				return new Date(
					Number.parseInt(year),
					Number.parseInt(month) - 1,
					Number.parseInt(day),
					Number.parseInt(hour),
					Number.parseInt(minute)
				)
			}
			// Format: DD/MM/YYYY (legacy)
			const [day, month, year] = dateStr.split('/')
			return new Date(
				Number.parseInt(year),
				Number.parseInt(month) - 1,
				Number.parseInt(day)
			)
		}

		const dateA = parseDate(a.date)
		const dateB = parseDate(b.date)
		return dateB.getTime() - dateA.getTime() // Newest first
	})

	return (
		<div className="flex flex-col h-full bg-card rounded-xl border shadow-sm overflow-hidden">
			{/* Header */}
			<div className="border-b px-6 py-4 flex-shrink-0">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-card-foreground">
							Pedidos Recentes
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Acompanhe o status dos seus pedidos
						</p>
					</div>
					<button
						onClick={() => refetch()}
						disabled={isLoading}
						className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						title="Recarregar pedidos"
					>
						<svg
							className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						{isLoading ? 'Carregando...' : 'Recarregar'}
					</button>
				</div>
			</div>

			{/* Orders List with Scroll - Contained within card */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-6">
					{isError ? (
						<div className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
								<svg
									className="w-8 h-8 text-red-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-medium text-card-foreground mb-2">
								Erro ao carregar pedidos
							</h3>
							<p className="text-muted-foreground mb-4">
								{error?.message || 'Erro ao carregar pedidos'}
							</p>
							<button
								onClick={() => refetch()}
								className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
							>
								Tentar novamente
							</button>
						</div>
					) : sortedOrders.length === 0 && !isLoading ? (
						<div className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
							<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
								<svg
									className="w-8 h-8 text-muted-foreground"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-medium text-card-foreground mb-2">
								Nenhum pedido encontrado
							</h3>
							<p className="text-muted-foreground">
								Use o assistente ao lado para fazer seu primeiro pedido!
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{sortedOrders.map((order, index) => (
								<div
									key={`${order.id}-${index}`}
									ref={
										index === sortedOrders.length - 1 ? lastElementRef : null
									}
									className="w-full"
								>
									<OrderCard order={order} />
								</div>
							))}

							{isFetchingNextPage && (
								<div className="flex justify-center py-4">
									<div className="flex items-center gap-2 text-muted-foreground">
										<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
										<span className="text-sm">Carregando mais pedidos...</span>
									</div>
								</div>
							)}

							{!hasNextPage && sortedOrders.length > 0 && (
								<div className="text-center py-4">
									<p className="text-sm text-muted-foreground">
										Todos os pedidos foram carregados
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
