import { LoaderCircle } from 'lucide-react'
import { Button } from '../ui/button'

type AuthenticateButtonProps = {
	loading?: boolean
	disabled?: boolean
	children?: React.ReactNode
	onClick?: () => void
}

export function AuthenticateButton({
	loading,
	disabled,
	children,
	onClick,
}: AuthenticateButtonProps) {
	return (
		<Button
			type="submit"
			disabled={disabled || loading}
			onClick={onClick}
			className="-mt-3 text-white bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80% w-full font-normal py-5 cursor-pointer hover:opacity-80 transition-opacity duration-200 ease-in-out"
		>
			{loading ? (
				<span className="ml-2">
					<LoaderCircle size={16} className="animate-spin" />
				</span>
			) : (
				<span className="ml-2">{children}</span>
			)}
		</Button>
	)
}
