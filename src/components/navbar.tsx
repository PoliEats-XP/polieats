'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, ShoppingBag, ChefHat } from 'lucide-react'
import { AvatarDropdown } from './avatar-dropdown'

export type NavbarProps = {
	variant?: 'default' | 'admin' | 'master'
	activeLink?: 'orders' | 'menu' | null
}

export function Navbar({
	variant = 'default',
	activeLink = null,
}: NavbarProps) {
	const [menuOpen, setMenuOpen] = useState(false)

	const toggleMenu = () => setMenuOpen((prev) => !prev)

	const renderLinks = () => {
		if (variant === 'default') return null

		// Master users get access to all existing admin functionality
		if (variant === 'master') {
			const masterLinks = [
				{
					key: 'orders',
					label: 'Pedidos',
					href: '/dashboard',
					icon: ShoppingBag,
					description: 'Gerenciar pedidos do sistema',
				},
				{
					key: 'menu',
					label: 'Menu',
					href: '/dashboard/menu',
					icon: ChefHat,
					description: 'Gerenciar cardápio e itens',
				},
			]

			return (
				<div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
					{masterLinks.map((link) => {
						const Icon = link.icon
						const isActive = activeLink === link.key

						return (
							<Link
								key={link.key}
								href={link.href}
								className={`flex items-center gap-2 transition-all duration-200 ${
									isActive
										? 'bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text font-medium'
										: 'hover:opacity-80'
								}`}
								title={link.description}
							>
								<Icon
									size={16}
									className={isActive ? 'text-gradient-from' : 'text-current'}
								/>
								<span>{link.label}</span>
							</Link>
						)
					})}
				</div>
			)
		}

		// Admin users get limited access to existing functionality only
		return (
			<div className="flex flex-col md:flex-row md:items-center gap-4">
				{activeLink === 'orders' ? (
					<>
						<p className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text flex items-center gap-2">
							<ShoppingBag size={16} className="text-gradient-from" />
							Pedidos
						</p>
						<Link
							href="/dashboard/menu"
							className="hover:opacity-80 transition flex items-center gap-2"
							title="Gerenciar cardápio e itens"
						>
							<ChefHat size={16} />
							Menu
						</Link>
					</>
				) : (
					<>
						<Link
							href="/dashboard"
							className="hover:opacity-80 transition flex items-center gap-2"
							title="Gerenciar pedidos do sistema"
						>
							<ShoppingBag size={16} />
							Pedidos
						</Link>
						<p className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text flex items-center gap-2">
							<ChefHat size={16} className="text-gradient-from" />
							Menu
						</p>
					</>
				)}
			</div>
		)
	}

	return (
		<nav className="border-b py-4">
			<div className="container mx-auto px-6">
				<div className="flex items-center justify-between">
					<Link href="/" className="flex items-center">
						<Image
							src="/main_logo.svg"
							alt="PoliEats Logo"
							width={40}
							height={40}
						/>
					</Link>

					<div className="flex items-center gap-4">
						<div className="hidden md:flex items-center gap-4">
							{renderLinks()}
						</div>

						<div className="hidden md:flex items-center gap-4">
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
					<div className="pt-2 border-t border-border">
						<div className="mt-2">
							<AvatarDropdown />
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}
