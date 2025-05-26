'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import {
	ChevronLeft,
	ChevronRight,
	Search,
	Filter,
	MoreHorizontal,
	Eye,
	Copy,
	RefreshCw,
} from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { AdminOrdersResponse, OrderStatus } from '@/types/admin'
import { OrderDetailsModal } from './order-details-modal'

interface OrdersTableProps {
	className?: string
}

async function fetchAdminOrders({
	page = 1,
	limit = 10,
	search = '',
	status = 'ALL',
}: {
	page?: number
	limit?: number
	search?: string
	status?: OrderStatus
}): Promise<AdminOrdersResponse> {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		...(search && { search }),
		...(status !== 'ALL' && { status }),
	})

	const response = await fetch(`/api/admin/orders?${params}`)

	if (!response.ok) {
		throw new Error('Failed to fetch orders')
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

export function OrdersTable({ className }: OrdersTableProps) {
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<OrderStatus>('ALL')
	const [searchInput, setSearchInput] = useState('')
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

	const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
		queryKey: ['admin-orders', page, limit, search, status],
		queryFn: () => fetchAdminOrders({ page, limit, search, status }),
		staleTime: 1000 * 60 * 2, // 2 minutes
	})

	const handleSearch = () => {
		setSearch(searchInput)
		setPage(1) // Reset to first page when searching
	}

	const handleStatusChange = (newStatus: OrderStatus) => {
		setStatus(newStatus)
		setPage(1) // Reset to first page when filtering
	}

	const handleLimitChange = (newLimit: string) => {
		setLimit(Number(newLimit))
		setPage(1) // Reset to first page when changing limit
	}

	const copyOrderId = (orderId: string) => {
		navigator.clipboard.writeText(orderId)
		toast.success('ID do pedido copiado!')
	}

	const viewOrderDetails = (orderId: string) => {
		setSelectedOrderId(orderId)
		setIsDetailsModalOpen(true)
	}

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Ctrl/Cmd + K to focus search
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault()
				const searchInput = document.querySelector(
					'input[placeholder*="Buscar"]'
				) as HTMLInputElement
				searchInput?.focus()
			}
			// Escape to clear search
			if (event.key === 'Escape' && (search || status !== 'ALL')) {
				setSearch('')
				setSearchInput('')
				setStatus('ALL')
				setPage(1)
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [search, status])

	if (isError) {
		return (
			<Card className={className}>
				<CardContent className="p-6">
					<div className="text-center">
						<p className="text-destructive mb-4">
							Erro ao carregar pedidos: {error?.message}
						</p>
						<Button onClick={() => refetch()} variant="outline">
							<RefreshCw className="w-4 h-4 mr-2" />
							Tentar novamente
						</Button>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Gerenciar Pedidos</span>
					<Button
						onClick={() => refetch()}
						variant="outline"
						size="sm"
						disabled={isFetching}
					>
						<RefreshCw
							className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
						/>
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Filters and Search */}
				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							placeholder="Buscar por ID, nome ou email... (Ctrl+K)"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
							className="pl-10"
						/>
					</div>
					<Button onClick={handleSearch} variant="outline">
						<Search className="w-4 h-4 mr-2" />
						Buscar
					</Button>
					<Select value={status} onValueChange={handleStatusChange}>
						<SelectTrigger className="w-[180px]">
							<Filter className="w-4 h-4 mr-2" />
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Todos os status</SelectItem>
							<SelectItem value="PENDING">Em andamento</SelectItem>
							<SelectItem value="COMPLETED">Concluído</SelectItem>
							<SelectItem value="CANCELED">Cancelado</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Table */}
				{isLoading ? (
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex space-x-4">
								<Skeleton className="h-12 w-20" />
								<Skeleton className="h-12 w-32" />
								<Skeleton className="h-12 w-24" />
								<Skeleton className="h-12 w-20" />
								<Skeleton className="h-12 w-24" />
								<Skeleton className="h-12 w-16" />
							</div>
						))}
					</div>
				) : data?.orders.length === 0 ? (
					<EmptyState className="py-12">
						<h3 className="text-lg font-semibold mb-2">
							Nenhum pedido encontrado
						</h3>
						<p className="text-muted-foreground mb-4">
							{search || status !== 'ALL'
								? 'Tente ajustar os filtros de busca.'
								: 'Ainda não há pedidos no sistema.'}
						</p>
						{(search || status !== 'ALL') && (
							<Button
								onClick={() => {
									setSearch('')
									setSearchInput('')
									setStatus('ALL')
									setPage(1)
								}}
								variant="outline"
							>
								Limpar filtros
							</Button>
						)}
					</EmptyState>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID do Pedido</TableHead>
									<TableHead>Pedido por</TableHead>
									<TableHead>Qtd de itens</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Data</TableHead>
									<TableHead>Total</TableHead>
									<TableHead className="w-[50px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data?.orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-mono text-sm">
											{order.id.slice(0, 8)}...
										</TableCell>
										<TableCell>
											<div>
												<div className="font-medium">{order.user.name}</div>
												<div className="text-sm text-muted-foreground">
													{order.user.email}
												</div>
											</div>
										</TableCell>
										<TableCell>{order.itemCount}</TableCell>
										<TableCell>
											<Badge variant={getStatusBadgeVariant(order.status)}>
												{getStatusLabel(order.status)}
											</Badge>
										</TableCell>
										<TableCell className="text-sm">{order.date}</TableCell>
										<TableCell className="font-medium">
											R$ {order.total.toFixed(2)}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="w-4 h-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => viewOrderDetails(order.id)}
													>
														<Eye className="w-4 h-4 mr-2" />
														Ver detalhes
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => copyOrderId(order.id)}
													>
														<Copy className="w-4 h-4 mr-2" />
														Copiar ID
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				{/* Pagination */}
				{data && data.orders.length > 0 && (
					<div className="flex items-center justify-between mt-6">
						<div className="flex items-center space-x-2">
							<p className="text-sm text-muted-foreground">
								Mostrando {(page - 1) * limit + 1} a{' '}
								{Math.min(page * limit, data.pagination.total)} de{' '}
								{data.pagination.total} pedidos
							</p>
						</div>
						<div className="flex items-center space-x-2">
							<Select
								value={limit.toString()}
								onValueChange={handleLimitChange}
							>
								<SelectTrigger className="w-[70px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="5">5</SelectItem>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
								</SelectContent>
							</Select>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>
							<span className="text-sm">
								Página {page} de {data.pagination.totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page + 1)}
								disabled={page >= data.pagination.totalPages}
							>
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				)}
			</CardContent>

			{/* Order Details Modal */}
			<OrderDetailsModal
				orderId={selectedOrderId}
				open={isDetailsModalOpen}
				onOpenChange={setIsDetailsModalOpen}
			/>
		</Card>
	)
}
