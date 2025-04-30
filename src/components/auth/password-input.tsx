'use client'

import type React from 'react'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PasswordInputProps {
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	className?: string
	disabled?: boolean
}

export function PasswordInput({
	placeholder = 'Enter your password',
	value,
	onChange,
	className,
	disabled = false,
}: PasswordInputProps) {
	const [password, setPassword] = useState(value || '')
	const [showPassword, setShowPassword] = useState(false)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value)
		onChange?.(e.target.value)
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	return (
		<div className="relative">
			<KeyRound className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#BBBBBB]" />
			<Input
				type={showPassword ? 'text' : 'password'}
				placeholder={placeholder}
				value={password}
				onChange={handleChange}
				className={cn(
					'pl-10 pr-10 px-14 py-6 placeholder:text-lg lg:text-4xl placeholder:text-[#BBBBBB] placeholder:font-light',
					className
				)}
				disabled={disabled}
			/>
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
		</div>
	)
}
