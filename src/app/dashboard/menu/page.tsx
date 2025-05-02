'use client'

import { AddItemDialog } from '@/components/item/add-item-dialog'
import { Item } from '@/components/item/item'
import { Navbar } from '@/components/navbar'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import { betterFetch } from '@better-fetch/fetch'
import { Plus } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'

interface ItemProps {
	id: string
	name: string
	quantity: number
	price: number
}

export default function Dashboard() {
	const [open, onOpenChange] = useState(false)
	const [items, setItems] = useState<ItemProps[]>([])
	const [filteredItems, setFilteredItems] = useState<ItemProps[]>([])
	const [search] = useQueryState('search', parseAsString.withDefault(''))

	useEffect(() => {
		async function fetchData() {
			const { data: itemsData } = await betterFetch<{ items: ItemProps[] }>(
				'/api/menu/items',
				{
					headers: { cookie: document.cookie },
					method: 'GET',
				}
			)

			console.log(itemsData?.items)
			const fetchedItems = itemsData?.items || []
			setItems(fetchedItems)

			const filtered = search
				? fetchedItems.filter((item) =>
						item.name.toLowerCase().includes(search.toLowerCase())
					)
				: fetchedItems
			setFilteredItems(filtered)
		}

		fetchData()
	}, [])

	const handleSearch = (filtered: ItemProps[]) => {
		setFilteredItems(filtered)
	}

	return (
		<>
			<Navbar variant="admin" activeLink="menu" />

			<div className="max-w-7xl mx-auto p-6 mt-12">
				<div className="flex justify-between items-center mb-3">
					<SearchInput items={items} onSearch={handleSearch} />
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
						<h1>Nenhum item encontrado...</h1>
					)}
				</div>
			</div>
		</>
	)
}
