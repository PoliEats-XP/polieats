import { Button } from './ui/button'

type LoginButtonProps = {
	loading?: boolean
	disabled?: boolean
}

export function LoginButton({ loading, disabled }: LoginButtonProps) {
	return (
		<Button
			type="submit"
			disabled={disabled || loading}
			className="-mt-3 text-white bg-gradient-to-r from-[#EB4834] from-0% to-[#F89C44] to-80% w-full font-normal py-5 cursor-pointer hover:opacity-80 transition-opacity duration-200 ease-in-out"
		>
			Entrar
		</Button>
	)
}
