'use client'

import { EmptyState } from '@/components/empty-state'
import { MenuItemCard } from '@/components/menu/menu-item-card'
import { Navbar } from '@/components/navbar'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { fetchMenu } from '@/utils/fetch-menu'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'

type SortOption = 'name' | 'price-low' | 'price-high' | 'quantity'

export function MenuClient() {
	const [search] = useQueryState('search', parseAsString.withDefault(''))
	const [sortBy, setSortBy] = useState<SortOption>('name')
	const [showFilters, setShowFilters] = useState(false)

	const {
		data: items = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['menu'],
		queryFn: fetchMenu,
		staleTime: 1000 * 60 * 5, // 5 minutes cache
	})

	const filteredAndSortedItems = useMemo(() => {
		let filtered = search
			? items.filter((item) =>
					item.name.toLowerCase().includes(search.toLowerCase())
				)
			: items

		// Sort items based on selected option
		switch (sortBy) {
			case 'name':
				filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
				break
			case 'price-low':
				filtered = filtered.sort((a, b) => a.price - b.price)
				break
			case 'price-high':
				filtered = filtered.sort((a, b) => b.price - a.price)
				break
			case 'quantity':
				filtered = filtered.sort((a, b) => b.quantity - a.quantity)
				break
		}

		return filtered
	}, [items, search, sortBy])

	return (
		<>
			{/* <Navbar variant="master" /> */}

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Nosso Menu
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Descubra nossos deliciosos pratos e bebidas
					</p>
				</div>

				<div className="flex flex-col gap-4 mb-6">
					<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
						<SearchInput
							items={items}
							disabled={items.length === 0}
							placeholder="Buscar no menu..."
							className="md:w-96 w-full"
						/>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowFilters(!showFilters)}
								className="flex items-center gap-2"
							>
								<SlidersHorizontal className="w-4 h-4" />
								Filtros
							</Button>
						</div>
					</div>

					{showFilters && (
						<div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div className="flex flex-col gap-2">
								<label
									htmlFor="sort-select"
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Ordenar por:
								</label>
								<Select
									value={sortBy}
									onValueChange={(value: SortOption) => setSortBy(value)}
								>
									<SelectTrigger id="sort-select" className="w-48">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="name">Nome (A-Z)</SelectItem>
										<SelectItem value="price-low">Menor preço</SelectItem>
										<SelectItem value="price-high">Maior preço</SelectItem>
										<SelectItem value="quantity">Disponibilidade</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{[...Array(8)].map((_, idx) => (
							<div
								key={idx}
								className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
							/>
						))}
					</div>
				) : error ? (
					<div className="text-center mt-20">
						<EmptyState>
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
								Erro ao carregar o menu
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								Ocorreu um erro ao carregar o cardápio. Tente novamente mais
								tarde.
							</p>
						</EmptyState>
					</div>
				) : filteredAndSortedItems.length > 0 ? (
					<>
						<div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
							{filteredAndSortedItems.length}{' '}
							{filteredAndSortedItems.length === 1
								? 'item encontrado'
								: 'itens encontrados'}
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{filteredAndSortedItems.map((item) => (
								<MenuItemCard
									key={item.id}
									id={item.id}
									name={item.name}
									price={item.price}
									quantity={item.quantity}
								/>
							))}
						</div>
					</>
				) : (
					<EmptyState className="mt-20">
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							{search ? 'Nenhum item encontrado' : 'Menu vazio'}
						</h3>
						<p className="text-gray-600 dark:text-gray-400">
							{search
								? `Não encontramos itens que correspondam a "${search}". Tente uma busca diferente.`
								: 'Ainda não há itens disponíveis no menu.'}
						</p>
					</EmptyState>
				)}
			</main>
		</>
	)
}
