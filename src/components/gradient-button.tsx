import { Chrome, LoaderCircle } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface GradientButtonProps {
	loading?: boolean
	disabled?: boolean
	children?: React.ReactNode
	onClick?: () => void
	variant?: 'filled' | 'google'
	className?: string
}

export function GradientButton({
	children,
	disabled,
	loading,
	onClick,
	variant,
	className,
}: GradientButtonProps) {
	return (
		<>
			{variant === 'filled' ? (
				<Button
					type="submit"
					disabled={disabled || loading}
					onClick={onClick}
					className={cn(
						'text-white bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80% w-full font-normal py-5 cursor-pointer hover:opacity-80 transition-opacity duration-200 ease-in-out',
						className
					)}
				>
					{loading ? (
						<span className="ml-2">
							<LoaderCircle size={16} className="animate-spin" />
						</span>
					) : (
						<span className="ml-2">{children}</span>
					)}
				</Button>
			) : (
				<div className="relative p-px bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80% rounded-md shadow-sm -mt-5">
					<Button
						onClick={onClick}
						type="button"
						className="flex items-center w-full cursor-pointer bg-white dark:bg-[#0a0a0a] text-[#ED2152] hover:bg-gradient-to-r hover:from-[#ED2152] hover:from-0% hover:to-[#C71585] hover:to-80% hover:text-white transition-all duration-300"
					>
						<Chrome />
						<span className="font-normal">Entrar com Google</span>
					</Button>
				</div>
			)}
		</>
	)
}
