import Image from 'next/image'
import { ThemeSwitcher } from './theme-switcher'
import { AvatarDropdown } from './avatar-dropdown'
import Link from 'next/link'

type NavbarProps = {
	variant?: 'default' | 'admin'
	activeLink?: 'orders' | 'menu'
}

export function Navbar({
	variant = 'default',
	activeLink = 'orders',
}: NavbarProps) {
	return (
		<>
			{variant === 'default' ? (
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
						<AvatarDropdown />
					</div>
				</div>
			) : (
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
						{activeLink === 'orders' ? (
							<>
								<p className="bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80% text-transparent bg-clip-text">
									Pedidos
								</p>
								<Link
									href="/dashboard/menu"
									className="cursor-pointer hover:opacity-80 transition-all"
								>
									Menu
								</Link>
							</>
						) : (
							<>
								<Link
									href="/dashboard"
									className="cursor-pointer hover:opacity-80 transition-all"
								>
									Pedidos
								</Link>
								<p className="bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80% text-transparent bg-clip-text">
									Menu
								</p>
							</>
						)}
						<ThemeSwitcher />
						<AvatarDropdown />
					</div>
				</div>
			)}
		</>
	)
}
