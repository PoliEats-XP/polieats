'use client'

import { EmptyState } from '@/components/empty-state'
import { AddItem } from '@/components/item/add-item'
import { Item } from '@/components/item/item'
import { Navbar } from '@/components/navbar'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { BulkEditDialog } from '@/components/bulk-edit-dialog'
import { fetchMenu } from '@/utils/fetch-menu'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import {
	Plus,
	Grid3X3,
	List,
	Download,
	Filter,
	SortAsc,
	SortDesc,
	Package,
	DollarSign,
	AlertTriangle,
	CheckCircle,
	Trash2,
	Edit,
} from 'lucide-react'
import {
	parseAsString,
	parseAsStringEnum,
	parseAsInteger,
	useQueryState,
} from 'nuqs'
import { useMemo, useState } from 'react'

type ViewMode = 'grid' | 'list'
type SortField = 'name' | 'price' | 'quantity'
type SortOrder = 'asc' | 'desc'
type StockFilter = 'all' | 'available' | 'low' | 'out'

interface ItemProps {
	id: string
	name: string
	quantity: number
	price: number
}

export function DashboardClient() {
	const [open, setOpen] = useState(false)
	const [selectedItems, setSelectedItems] = useState<string[]>([])
	const [showFilters, setShowFilters] = useState(false)
	const [bulkEditOpen, setBulkEditOpen] = useState(false)
	const queryClient = useQueryClient()

	// Get user session for navbar variant
	const { data } = authClient.useSession()
	const session = data
	const navbarVariant = session?.user?.role === 'master' ? 'master' : 'admin'

	// URL state management
	const [search] = useQueryState('search', parseAsString.withDefault(''))
	const [viewMode, setViewMode] = useQueryState(
		'view',
		parseAsStringEnum<ViewMode>(['grid', 'list']).withDefault('grid')
	)
	const [sortField, setSortField] = useQueryState(
		'sort',
		parseAsStringEnum<SortField>(['name', 'price', 'quantity']).withDefault(
			'name'
		)
	)
	const [sortOrder, setSortOrder] = useQueryState(
		'order',
		parseAsStringEnum<SortOrder>(['asc', 'desc']).withDefault('asc')
	)
	const [stockFilter, setStockFilter] = useQueryState(
		'stock',
		parseAsStringEnum<StockFilter>([
			'all',
			'available',
			'low',
			'out',
		]).withDefault('all')
	)
	const [minPrice, setMinPrice] = useQueryState(
		'minPrice',
		parseAsInteger.withDefault(0)
	)
	const [maxPrice, setMaxPrice] = useQueryState(
		'maxPrice',
		parseAsInteger.withDefault(1000)
	)

	const {
		data: items = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['menu'],
		queryFn: fetchMenu,
		staleTime: 1000 * 60 * 5, // 5 minutes cache
	})

	// Enhanced filtering and sorting logic
	const filteredAndSortedItems = useMemo(() => {
		let filtered = items

		// Search filter
		if (search) {
			filtered = filtered.filter((item) =>
				item.name.toLowerCase().includes(search.toLowerCase())
			)
		}

		// Price range filter
		filtered = filtered.filter(
			(item) => item.price >= minPrice && item.price <= maxPrice
		)

		// Stock status filter
		if (stockFilter !== 'all') {
			filtered = filtered.filter((item) => {
				switch (stockFilter) {
					case 'available':
						return item.quantity > 5
					case 'low':
						return item.quantity > 0 && item.quantity <= 5
					case 'out':
						return item.quantity === 0
					default:
						return true
				}
			})
		}

		// Sorting
		filtered.sort((a, b) => {
			let aValue: string | number
			let bValue: string | number

			switch (sortField) {
				case 'name':
					aValue = a.name.toLowerCase()
					bValue = b.name.toLowerCase()
					break
				case 'price':
					aValue = a.price
					bValue = b.price
					break
				case 'quantity':
					aValue = a.quantity
					bValue = b.quantity
					break
				default:
					return 0
			}

			if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
			if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
			return 0
		})

		return filtered
	}, [items, search, minPrice, maxPrice, stockFilter, sortField, sortOrder])

	// Statistics
	const stats = useMemo(() => {
		const totalItems = items.length
		const totalValue = items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		)
		const lowStockItems = items.filter(
			(item) => item.quantity > 0 && item.quantity <= 5
		).length
		const outOfStockItems = items.filter((item) => item.quantity === 0).length
		const availableItems = items.filter((item) => item.quantity > 5).length

		return {
			totalItems,
			totalValue,
			lowStockItems,
			outOfStockItems,
			availableItems,
		}
	}, [items])

	// Bulk actions
	const handleSelectAll = () => {
		if (selectedItems.length === filteredAndSortedItems.length) {
			setSelectedItems([])
		} else {
			setSelectedItems(filteredAndSortedItems.map((item) => item.id))
		}
	}

	const handleSelectItem = (itemId: string) => {
		setSelectedItems((prev) =>
			prev.includes(itemId)
				? prev.filter((id) => id !== itemId)
				: [...prev, itemId]
		)
	}

	// Export functionality
	const exportToCSV = () => {
		const csvContent = [
			['Nome', 'Preço', 'Quantidade', 'Valor Total'],
			...filteredAndSortedItems.map((item) => [
				item.name,
				item.price.toString(),
				item.quantity.toString(),
				(item.price * item.quantity).toString(),
			]),
		]
			.map((row) => row.join(','))
			.join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'menu-items.csv'
		a.click()
		window.URL.revokeObjectURL(url)
	}

	// Bulk edit functionality
	const handleBulkEdit = async (updates: {
		priceChange?: number
		quantityChange?: number
		newPrice?: number
		newQuantity?: number
	}) => {
		try {
			// Get the selected items data
			const selectedItemsData = items.filter((item) =>
				selectedItems.includes(item.id)
			)

			// Prepare update promises for each selected item
			const updatePromises = selectedItemsData.map(async (item) => {
				// Calculate new values based on update mode
				let newPrice = Number(item.price)
				let newQuantity = Number(item.quantity)

				if (updates.priceChange !== undefined) {
					// Relative price change
					newPrice = Number(item.price) + updates.priceChange
				} else if (updates.newPrice !== undefined) {
					// Absolute price change
					newPrice = updates.newPrice
				}

				if (updates.quantityChange !== undefined) {
					// Relative quantity change
					newQuantity = Number(item.quantity) + updates.quantityChange
				} else if (updates.newQuantity !== undefined) {
					// Absolute quantity change
					newQuantity = updates.newQuantity
				}

				// Ensure values are not negative
				newPrice = Math.max(0, newPrice)
				newQuantity = Math.max(0, newQuantity)

				// Make API call to update the item
				const response = await fetch('/api/menu/items', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: item.id,
						name: item.name,
						price: newPrice,
						initial_available_quantity: newQuantity,
					}),
				})

				if (!response.ok) {
					throw new Error(`Failed to update item ${item.name}`)
				}

				return response.json()
			})

			// Execute all updates
			await Promise.all(updatePromises)

			// Invalidate and refetch the menu data
			queryClient.invalidateQueries({ queryKey: ['menu'] })

			// Clear selection after successful update
			setSelectedItems([])

			console.log('Bulk edit completed successfully')
		} catch (error) {
			console.error('Bulk edit failed:', error)
			// You could add a toast notification here to show the error to the user
		}
	}

	return (
		<>
			<Navbar variant={navbarVariant} activeLink="menu" />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
				{/* Statistics Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total de Itens
							</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalItems}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Valor Total</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								R$ {Number(stats.totalValue).toFixed(2)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
							<CheckCircle className="h-4 w-4 text-green-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-500">
								{stats.availableItems}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Estoque Baixo
							</CardTitle>
							<AlertTriangle className="h-4 w-4 text-orange-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-orange-500">
								{stats.lowStockItems}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Esgotados</CardTitle>
							<AlertTriangle className="h-4 w-4 text-red-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-500">
								{stats.outOfStockItems}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Search and Controls */}
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
					<div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
						<SearchInput
							items={items}
							disabled={items.length === 0}
							placeholder="Buscar item..."
							className="w-full sm:w-80"
						/>

						<Button
							variant="outline"
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center gap-2 w-full sm:w-auto"
						>
							<Filter className="w-4 h-4" />
							Filtros
							{showFilters && (
								<Badge variant="secondary" className="ml-1">
									Ativo
								</Badge>
							)}
						</Button>
					</div>

					<div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
						{/* View Toggle */}
						<div className="flex items-center border rounded-md">
							<Button
								variant={viewMode === 'grid' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setViewMode('grid')}
								className="rounded-r-none"
							>
								<Grid3X3 className="w-4 h-4" />
							</Button>
							<Button
								variant={viewMode === 'list' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setViewMode('list')}
								className="rounded-l-none"
							>
								<List className="w-4 h-4" />
							</Button>
						</div>

						{/* Export */}
						<Button
							variant="outline"
							onClick={exportToCSV}
							className="flex items-center gap-2"
						>
							<Download className="w-4 h-4" />
							<span className="hidden sm:inline">Exportar</span>
						</Button>

						{/* Add Item */}
						<Button
							variant="outline"
							className="flex items-center gap-2"
							onClick={() => setOpen(true)}
						>
							<Plus className="w-4 h-4" />
							<span className="hidden sm:inline">Adicionar</span>
						</Button>
					</div>
				</div>

				{/* Advanced Filters */}
				{showFilters && (
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="text-lg">Filtros Avançados</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								{/* Sort */}
								<div className="space-y-2">
									<label htmlFor="sort-field" className="text-sm font-medium">
										Ordenar por
									</label>
									<Select
										value={sortField}
										onValueChange={(value: SortField) => setSortField(value)}
									>
										<SelectTrigger id="sort-field">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="name">Nome</SelectItem>
											<SelectItem value="price">Preço</SelectItem>
											<SelectItem value="quantity">Quantidade</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Sort Order */}
								<div className="space-y-2">
									<label htmlFor="sort-order" className="text-sm font-medium">
										Ordem
									</label>
									<Button
										id="sort-order"
										variant="outline"
										onClick={() =>
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
										}
										className="w-full justify-start"
									>
										{sortOrder === 'asc' ? (
											<SortAsc className="w-4 h-4 mr-2" />
										) : (
											<SortDesc className="w-4 h-4 mr-2" />
										)}
										{sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
									</Button>
								</div>

								{/* Stock Filter */}
								<div className="space-y-2">
									<label htmlFor="stock-filter" className="text-sm font-medium">
										Status do Estoque
									</label>
									<Select
										value={stockFilter}
										onValueChange={(value: StockFilter) =>
											setStockFilter(value)
										}
									>
										<SelectTrigger id="stock-filter">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos</SelectItem>
											<SelectItem value="available">Disponível</SelectItem>
											<SelectItem value="low">Estoque Baixo</SelectItem>
											<SelectItem value="out">Esgotado</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Price Range */}
								<div className="space-y-2">
									<label htmlFor="price-range" className="text-sm font-medium">
										Faixa de Preço
									</label>
									<div className="flex gap-2" id="price-range">
										<input
											type="number"
											placeholder="Min"
											value={minPrice}
											onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
											className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
											aria-label="Preço mínimo"
										/>
										<input
											type="number"
											placeholder="Max"
											value={maxPrice}
											onChange={(e) =>
												setMaxPrice(Number(e.target.value) || 1000)
											}
											className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
											aria-label="Preço máximo"
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Bulk Actions */}
				{selectedItems.length > 0 && (
					<Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
						<CardContent className="pt-6">
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
									<Badge variant="secondary">
										{selectedItems.length} selecionados
									</Badge>
									<span className="text-sm text-muted-foreground">
										de {filteredAndSortedItems.length} itens
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setBulkEditOpen(true)}
										className="flex-1 sm:flex-none"
									>
										<Edit className="w-4 h-4 mr-2" />
										Editar em Lote
									</Button>
									<Button
										variant="destructive"
										size="sm"
										className="flex-1 sm:flex-none"
									>
										<Trash2 className="w-4 h-4 mr-2" />
										Excluir Selecionados
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedItems([])}
										className="flex-1 sm:flex-none"
									>
										Cancelar
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Items Display */}
				{isLoading ? (
					<div
						className={
							viewMode === 'grid'
								? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
								: 'space-y-4'
						}
					>
						{[...Array(6)].map((_, idx) => (
							<div
								key={idx}
								className={
									viewMode === 'grid'
										? 'h-40 bg-gray-100 dark:bg-gray-1200 animate-pulse rounded-lg'
										: 'h-20 bg-gray-100 dark:bg-gray-1200 animate-pulse rounded-lg'
								}
							/>
						))}
					</div>
				) : error ? (
					<div className="text-center mt-20">
						Ocorreu um erro ao carregar o cardápio. Tente novamente mais tarde.
					</div>
				) : filteredAndSortedItems.length > 0 ? (
					<>
						{/* Select All */}
						<div className="flex items-center gap-2 mb-4">
							<Checkbox
								checked={selectedItems.length === filteredAndSortedItems.length}
								onCheckedChange={handleSelectAll}
							/>
							<span className="text-sm text-muted-foreground">
								Selecionar todos ({filteredAndSortedItems.length} itens)
							</span>
						</div>

						{viewMode === 'grid' ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
								{filteredAndSortedItems.map((item) => (
									<Item
										key={item.id}
										id={item.id}
										name={item.name}
										available_quantity={item.quantity}
										price={item.price}
										isSelected={selectedItems.includes(item.id)}
										onSelect={handleSelectItem}
										showCheckbox={true}
									/>
								))}
							</div>
						) : (
							<div className="space-y-4">
								{filteredAndSortedItems.map((item) => (
									<Card key={item.id} className="p-4">
										<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
											<div className="flex items-center gap-4 w-full">
												<Checkbox
													checked={selectedItems.includes(item.id)}
													onCheckedChange={() => handleSelectItem(item.id)}
												/>
												<div className="flex-1 min-w-0">
													<h3 className="font-semibold truncate">
														{item.name}
													</h3>
													<p className="text-sm text-muted-foreground">
														Quantidade: {item.quantity} | Preço: R${' '}
														{Number(item.price).toFixed(2)}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
												{item.quantity === 0 && (
													<Badge variant="destructive">Esgotado</Badge>
												)}
												{item.quantity > 0 && item.quantity <= 5 && (
													<Badge
														variant="outline"
														className="border-orange-300 text-orange-600"
													>
														Estoque Baixo
													</Badge>
												)}
												{item.quantity > 5 && (
													<Badge variant="secondary">Disponível</Badge>
												)}
											</div>
										</div>
									</Card>
								))}
							</div>
						)}
					</>
				) : (
					<EmptyState className="mt-20">
						{search || stockFilter !== 'all' || minPrice > 0 || maxPrice < 1000
							? 'Nenhum item encontrado com os filtros aplicados.'
							: 'Nenhum item encontrado. Que tal adicionar um novo?'}
					</EmptyState>
				)}

				<AddItem open={open} onOpenChange={setOpen} />

				<BulkEditDialog
					open={bulkEditOpen}
					onOpenChange={setBulkEditOpen}
					selectedItems={selectedItems}
					items={items}
					onSave={handleBulkEdit}
				/>
			</main>
		</>
	)
}
