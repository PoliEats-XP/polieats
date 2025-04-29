import Image from 'next/image'
import { Avatar, AvatarFallback } from './ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { ThemeSwitcher } from './theme-switcher'

export function Navbar() {
	return (
		<div className="flex border-b items-center justify-between px-6 py-4">
			<div className="flex items-center gap-2">
				<Image
					src="/main_logo.svg"
					alt="PoliEats Logo"
					width={40}
					height={40}
				/>

				<h1 className="text-2xl bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80% text-transparent bg-clip-text font-normal">
					polieats
				</h1>
			</div>

			<div className="flex items-center gap-4">
				<ThemeSwitcher />
				<Avatar>
					<AvatarImage src="https://github.com/gbrasil720.png" />
					<AvatarFallback>GB</AvatarFallback>
				</Avatar>
			</div>
		</div>
	)
}
