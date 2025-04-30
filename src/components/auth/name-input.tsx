import { useState } from 'react'
import { User } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

interface NameInputProps {
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	className?: string
	disabled?: boolean
}

export function NameInput({
	className,
	disabled,
	onChange,
	placeholder = 'John Doe',
	value,
}: NameInputProps) {
	const [name, setName] = useState(value || '')

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value)
		onChange?.(event.target.value)
	}

	return (
		<div className="relative">
			<User className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#BBBBBB]" />
			<Input
				type="text"
				placeholder={placeholder}
				value={name}
				onChange={handleChange}
				className={cn(
					'px-14 py-6 text-base placeholder:text-lg placeholder:text-[#BBBBBB] placeholder:font-light',
					className
				)}
				disabled={disabled}
			/>
		</div>
	)
}
