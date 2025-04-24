import { Chrome } from 'lucide-react'
import { Button } from './ui/button'

export function GoogleLoginButton() {
	return (
		<div className="relative p-px bg-gradient-to-r from-[#EB4834] from-0% to-[#F89C44] to-80% rounded-md shadow-sm -mt-5">
			<Button className="flex items-center w-full cursor-pointer bg-white text-[#EB4834] hover:bg-gradient-to-r hover:from-[#EB4834] hover:from-0% hover:to-[#F89C44] hover:to-80% hover:text-white transition-all duration-300">
				<Chrome />
				<span className="font-normal">Entrar com Google</span>
			</Button>
		</div>
	)
}
