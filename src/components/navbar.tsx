'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { ThemeSwitcher } from './theme-switcher'
import { AvatarDropdown } from './avatar-dropdown'

export type NavbarProps = {
	variant?: 'default' | 'admin'
	activeLink?: 'orders' | 'menu'
}

export function Navbar({
	variant = 'default',
	activeLink = 'orders',
}: NavbarProps) {
	const [menuOpen, setMenuOpen] = useState(false)

	const toggleMenu = () => setMenuOpen((prev) => !prev)

	const renderLinks = () => {
		if (variant === 'default') return null

		return (
			<div className="flex flex-col md:flex-row md:items-center gap-4">
				{activeLink === 'orders' ? (
					<>
						<p className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
							Pedidos
						</p>
						<Link
							href="/dashboard/menu"
							className="hover:opacity-80 transition"
						>
							Menu
						</Link>
					</>
				) : (
					<>
						<Link href="/dashboard" className="hover:opacity-80 transition">
							Pedidos
						</Link>
						<p className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
							Menu
						</p>
					</>
				)}
			</div>
		)
	}

	return (
		<nav className="border-b px-6 py-4">
			<div className="flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2">
					<Image
						src="/main_logo.svg"
						alt="PoliEats Logo"
						width={40}
						height={40}
					/>
					<h1 className="text-2xl bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text font-normal">
						polieats
					</h1>
				</Link>

				<div className="flex items-center gap-4">
					<div className="hidden md:flex items-center gap-4">
						{renderLinks()}
					</div>

					<div className="hidden md:flex items-center gap-4">
						<ThemeSwitcher />
						<AvatarDropdown />
					</div>

					<button
						onClick={toggleMenu}
						aria-label="Toggle menu"
						className="md:hidden relative p-2 focus:outline-none"
					>
						<Menu
							size={24}
							className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out ${
								menuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'
							}`}
						/>
						<X
							size={24}
							className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out ${
								menuOpen ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'
							}`}
						/>
					</button>
				</div>
			</div>

			<div
				className={`mt-4 flex flex-col gap-4 md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
					menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				{variant !== 'default' && renderLinks()}
				<ThemeSwitcher />
				<AvatarDropdown />
			</div>
		</nav>
	)
}
