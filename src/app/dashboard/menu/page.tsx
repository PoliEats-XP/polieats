'use client'

import { EmptyState } from '@/components/empty-state'
import { AddItemDialog } from '@/components/item/add-item-dialog'
import { Item } from '@/components/item/item'
import { Navbar } from '@/components/navbar'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import { fetchMenu } from '@/utils/fetch-menu'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'

export default function Dashboard() {
	const [open, setOpen] = useState(false)
	const [search] = useQueryState('search', parseAsString.withDefault(''))

	const {
		data: items = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['menu'],
		queryFn: fetchMenu,
		staleTime: 1000 * 60 * 5, // 5 minutes cache
	})

	const filteredItems = useMemo(
		() =>
			search
				? items.filter((item) =>
						item.name.toLowerCase().includes(search.toLowerCase())
					)
				: items,
		[items, search]
	)

	return (
		<>
			<Navbar variant="admin" activeLink="menu" />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
					<SearchInput
						items={items}
						disabled={items.length === 0}
						placeholder="Buscar item..."
						className="md:w-full w-[70%]"
					/>

					<Button
						variant="outline"
						className="flex items-center font-light py-2 px-4 cursor-pointer"
						onClick={() => setOpen(true)}
					>
						<Plus className="w-4 h-4 mr-2" />
						Adicionar item
					</Button>

					<AddItemDialog open={open} onOpenChange={setOpen} />
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{[...Array(6)].map((_, idx) => (
							<div
								key={idx}
								className="h-40 bg-gray-100 dark:bg-[#333] animate-pulse rounded-lg"
							/>
						))}
					</div>
				) : error ? (
					<div className="text-center text-red-600 mt-20">
						Ocorreu um erro ao carregar o cardápio. Tente novamente mais tarde.
					</div>
				) : filteredItems.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
						{filteredItems.map((item) => (
							<Item
								key={item.id}
								id={item.id}
								name={item.name}
								available_quantity={item.quantity}
								price={item.price}
							/>
						))}
					</div>
				) : (
					<EmptyState className="mt-20">
						Nenhum item encontrado. Que tal adicionar um novo?
					</EmptyState>
				)}
			</main>
		</>
	)
}
