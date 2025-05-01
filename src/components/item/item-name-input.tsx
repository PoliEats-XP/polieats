import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

interface ItemNameInputProps {
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	className?: string
	disabled?: boolean
}

export function ItemNameInput({
	className,
	disabled,
	onChange,
	placeholder = 'Chiclete de menta',
	value,
}: ItemNameInputProps) {
	const [itemName, setItemName] = useState(value || '')

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setItemName(event.target.value)
		onChange?.(event.target.value)
	}

	return (
		<div className="relative">
			<Pencil className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#BBBBBB]" />
			<Input
				type="text"
				placeholder={placeholder}
				value={itemName}
				onChange={handleChange}
				className={cn(
					'px-14 py-6 text-xl placeholder:text-lg placeholder:text-[#BBBBBB] placeholder:font-light',
					className
				)}
				disabled={disabled}
			/>
		</div>
	)
}
