'use client'

import { AddItemDialog } from '@/components/item/add-item-dialog'
import { Item } from '@/components/item/item'
import { Navbar } from '@/components/navbar'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import { fetchMenu } from '@/utils/fetch-menu'
import { betterFetch } from '@better-fetch/fetch'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'

interface ItemProps {
	id: string
	name: string
	quantity: number
	price: number
}

export default function Dashboard() {
	const [open, onOpenChange] = useState(false)
	// const [items, setItems] = useState<ItemProps[]>([])
	// const [filteredItems, setFilteredItems] = useState<ItemProps[]>([])
	const [search] = useQueryState('search', parseAsString.withDefault(''))

	const {
		data: items = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['menu'],
		queryFn: fetchMenu,
	})

	const filteredItems = useMemo(() => {
		return search
			? items.filter((item) =>
					item.name.toLowerCase().includes(search.toLowerCase())
				)
			: items
	}, [items, search])

	const handleSearch = (filtered: ItemProps[]) => {}

	return (
		<>
			<Navbar variant="admin" activeLink="menu" />

			<div className="max-w-7xl mx-auto p-6 mt-12">
				<div className="flex justify-between items-center mb-3">
					<SearchInput items={items} />
					<Button
						variant="outline"
						className="flex items-center text-normal py-1 cursor-pointer"
						onClick={() => onOpenChange(true)}
					>
						<Plus className="size-4 mr-1" /> Adicionar item ao menu
					</Button>
					<AddItemDialog open={open} onOpenChange={onOpenChange} />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{filteredItems.length > 0 ? (
						filteredItems.map((item) => (
							<Item
								key={item.id}
								id={item.id}
								name={item.name}
								available_quantity={item.quantity}
								price={item.price}
							/>
						))
					) : (
						<h1>Nenhum item encontrado...</h1> // TODO: Add a nice empty state here
					)}
				</div>
			</div>
		</>
	)
}
