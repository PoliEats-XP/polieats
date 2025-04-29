import { Chrome } from 'lucide-react'
import { Button } from '../ui/button'

export function GoogleLoginButton() {
	return (
		<div className="relative p-px bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80% rounded-md shadow-sm -mt-5">
			<Button className="flex items-center w-full cursor-pointer bg-white dark:bg-[#0a0a0a] text-[#ED2152] hover:bg-gradient-to-r hover:from-[#ED2152] hover:from-0% hover:to-[#C71585] hover:to-80% hover:text-white transition-all duration-300">
				<Chrome />
				<span className="font-normal">Entrar com Google</span>
			</Button>
		</div>
	)
}
