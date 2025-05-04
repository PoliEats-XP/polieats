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

interface ItemProps {
	id: string
	name: string
	quantity: number
	price: number
}

export default function Dashboard() {
	const [open, onOpenChange] = useState(false)
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
					<SearchInput items={items} disabled={filteredItems.length <= 0} className='hover:cursor-not-allowed'/>
					<Button
						variant="outline"
						className="flex items-center text-normal py-1 cursor-pointer font-light"
						onClick={() => onOpenChange(true)}
					>
						<Plus className="size-4 mr-1" /> Adicionar item ao menu
					</Button>
					<AddItemDialog open={open} onOpenChange={onOpenChange} />
				</div>

					{filteredItems.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
						<EmptyState className='mt-20'>
							Nenhum item foi encontrado no cardápio... Que tal adicionar um?
						</EmptyState>
					)}
			</div>
		</>
	)
}
