import { useState } from 'react'
import { AtSign } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

interface EmailInputProps {
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	className?: string
	disabled?: boolean
}

export function EmailInput({
	className,
	disabled,
	onChange,
	placeholder = 'email@email.com',
	value,
}: EmailInputProps) {
	const [email, setEmail] = useState(value || '')

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(event.target.value)
		onChange?.(event.target.value)
	}

	return (
		<div className="relative">
			<AtSign className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#BBBBBB]" />
			<Input
				type="email"
				placeholder={placeholder}
				value={email}
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
