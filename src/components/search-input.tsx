'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps {
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	className?: string
	disabled?: boolean
}

export function SearchInput({
	className,
	disabled,
	onChange,
	placeholder = 'Buscar item',
	value,
}: SearchInputProps) {
	const [search, setSearch] = useState(value || '')

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
		onChange?.(event.target.value)
	}

	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BBBBBB]" />
			<Input
				type="text"
				placeholder={placeholder}
				value={search}
				onChange={handleChange}
				className={cn(
					'px-14 py-4 text-base placeholder:text-normal placeholder:text-[#BBBBBB] placeholder:font-light',
					className
				)}
				disabled={disabled}
			/>
		</div>
	)
}
