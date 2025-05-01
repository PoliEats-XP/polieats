import { useState } from 'react'
import { DollarSign, Hash } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

interface ItemPriceInputProps {
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	className?: string
	disabled?: boolean
}

export function ItemPriceInput({
	className,
	disabled,
	onChange,
	placeholder = '17',
	value,
}: ItemPriceInputProps) {
	const [itemPrice, setItemPrice] = useState(value || '')

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setItemPrice(event.target.value)
		onChange?.(event.target.value)
	}

	return (
		<div className="relative">
			<DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#BBBBBB]" />
			<Input
				type="number"
				placeholder={placeholder}
				value={itemPrice}
				onChange={handleChange}
				className={cn(
					'px-14 py-6 text-xl placeholder:text-lg placeholder:text-[#BBBBBB] placeholder:font-light [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
					className
				)}
				disabled={disabled}
			/>
		</div>
	)
}
