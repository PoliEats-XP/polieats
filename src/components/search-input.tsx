'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { parseAsString, useQueryState } from 'nuqs'

interface ItemProps {
	id: string
	name: string
	quantity: number
	price: number
}

interface SearchInputProps {
	placeholder?: string
	className?: string
	disabled?: boolean
	items: ItemProps[]
	onSearch: (filteredItems: ItemProps[]) => void
}

export function SearchInput({
	className,
	disabled,
	items = [],
	placeholder = 'Buscar item',
	onSearch,
}: SearchInputProps) {
	const [search, setSearch] = useQueryState(
		'search',
		parseAsString.withDefault('')
	)
	const [isFocused, setIsFocused] = useState(false)

	const filteredItems = items.filter((item) =>
		item.name.toLowerCase().includes(search.toLowerCase())
	)

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value
		setSearch(query)

		const filtered = items.filter((item) =>
			item.name.toLowerCase().includes(query.toLowerCase())
		)
		onSearch(filtered)
	}

	const handleSelect = (item: ItemProps) => {
		setSearch(item.name)
		setIsFocused(false)
		onSearch([item])
	}

	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BBBBBB]" />
			<Input
				type="text"
				placeholder={placeholder}
				value={search}
				onChange={handleChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setTimeout(() => setIsFocused(false), 200)}
				className={cn(
					'px-14 py-4 text-base placeholder:text-normal placeholder:text-[#BBBBBB] placeholder:font-light',
					className
				)}
				disabled={disabled}
			/>

			{isFocused && search && filteredItems.length > 0 && (
				<div className="absolute z-10 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
					{filteredItems.map((item) => (
						// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
						<div
							key={item.id}
							className="cursor-pointer px-4 py-2 hover:bg-gray-100"
							onClick={() => handleSelect(item)}
						>
							{item.name} - R${item.price}
						</div>
					))}
				</div>
			)}

			{isFocused && search && filteredItems.length === 0 && (
				<div className="absolute z-10 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg px-4 py-2">
					Nenhum item encontrado
				</div>
			)}
		</div>
	)
}
