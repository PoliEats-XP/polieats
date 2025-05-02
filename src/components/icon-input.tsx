import { useState } from 'react'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface IconProps {
	className?: string
}

interface IconInputProps {
	placeholder?: string
	inputValue?: string | number
	onChange?: (value: string | number) => void
	className?: string
	disabled?: boolean
	inputType?: React.HTMLInputTypeAttribute
	LeftIcon?: React.ComponentType<IconProps>
	leftIconSize?: number
}

export function IconInput({
	inputValue,
	inputType = 'text',
	placeholder,
	onChange,
	className,
	disabled,
	LeftIcon,
	leftIconSize = 6,
}: IconInputProps) {
	const [value, setValue] = useState(inputValue || '')
	const [showPassword, setShowPassword] = useState(false)

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (inputType === 'number') {
			const num = event.target.valueAsNumber
			if (Number.isNaN(num)) return

			setValue(num)
			onChange?.(num)
		}

		const text = event.target.value
		setValue(text)
		onChange?.(text)
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	const type =
		inputType === 'password' ? (showPassword ? 'text' : 'password') : inputType

	return (
		<div className="relative">
			{LeftIcon && (
				<LeftIcon
					className={`absolute left-3 top-1/2 h-${leftIconSize} w-${leftIconSize} -translate-y-1/2 text-[#BBBBBB]`}
				/>
			)}
			<Input
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				className={cn(
					'px-14 py-6 text-base placeholder:text-lg placeholder:text-[#BBBBBB] placeholder:font-light',
					inputType === 'number' &&
						'[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
					className
				)}
				disabled={disabled}
			/>
			{inputType === 'password' && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full p-0"
					onClick={togglePasswordVisibility}
					disabled={disabled}
				>
					{showPassword ? (
						<EyeOff className="h-5 w-5 text-[#BBBBBB] size-5" />
					) : (
						<Eye className="h-5 w-5 text-[#BBBBBB] size-5" />
					)}
					<span className="sr-only">
						{showPassword ? 'Hide password' : 'Show password'}
					</span>
				</Button>
			)}
		</div>
	)
}
