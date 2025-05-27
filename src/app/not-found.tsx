'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Home, ArrowLeft, FileText, Settings, User } from 'lucide-react'
import { AuthHero } from '@/components/auth/auth-hero'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { authClient } from '@/lib/auth-client'

export default function NotFound() {
	const [searchQuery, setSearchQuery] = useState('')
	const [isAnimating, setIsAnimating] = useState(false)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const router = useRouter()

	// Get user session for role-based filtering
	const { data } = authClient.useSession()
	const session = data
	const userRole = session?.user?.role

	// Available pages based on user role
	const availablePages = useMemo(() => {
		const allPages = [
			// Common user pages
			{
				name: 'Home',
				path: '/',
				description: 'Página inicial',
				roles: ['user', 'admin', 'master'],
			},
			{
				name: 'Menu',
				path: '/menu',
				description: 'Ver cardápio',
				roles: ['user', 'admin', 'master'],
			},
			{
				name: 'Pedidos',
				path: '/orders',
				description: 'Ver pedidos',
				roles: ['user', 'admin', 'master'],
			},
			{
				name: 'Perfil',
				path: '/profile',
				description: 'Gerenciar perfil',
				roles: ['user', 'admin', 'master'],
			},

			// Auth pages (available to all when not logged in)
			{
				name: 'Login',
				path: '/login',
				description: 'Fazer login',
				roles: ['guest', 'user', 'admin', 'master'],
			},
			{
				name: 'Registro',
				path: '/register',
				description: 'Criar conta',
				roles: ['guest', 'user', 'admin', 'master'],
			},
			{
				name: 'Esqueci a senha',
				path: '/forgot-password',
				description: 'Recuperar senha',
				roles: ['guest', 'user', 'admin', 'master'],
			},

			// Admin pages
			{
				name: 'Dashboard',
				path: '/dashboard',
				description: 'Painel administrativo',
				roles: ['admin', 'master'],
			},
			{
				name: 'Gerenciar Menu',
				path: '/dashboard/menu',
				description: 'Gerenciar cardápio',
				roles: ['admin', 'master'],
			},

			// Master-only pages (if any specific ones exist)
			{
				name: 'Configurações',
				path: '/settings',
				description: 'Configurações do sistema',
				roles: ['master'],
			},
		]

		// Filter pages based on user role
		const currentRole = userRole || 'guest'
		return allPages.filter((page) => page.roles.includes(currentRole))
	}, [userRole])

	// Filter suggestions based on search query
	const suggestions = useMemo(() => {
		if (!searchQuery.trim()) return []
		return availablePages
			.filter(
				(page) =>
					page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					page.description.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.slice(0, 5)
	}, [searchQuery, availablePages])

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			setIsAnimating(true)
			setShowSuggestions(false)
			setTimeout(() => {
				router.push(`/?search=${encodeURIComponent(searchQuery)}`)
			}, 500)
		}
	}

	const handleSuggestionClick = (path: string) => {
		setIsAnimating(true)
		setShowSuggestions(false)
		setTimeout(() => {
			router.push(path)
		}, 300)
	}

	const handleGoBack = () => {
		setIsAnimating(true)
		setTimeout(() => {
			router.back()
		}, 300)
	}

	// Quick actions based on user role
	const quickActions = useMemo(() => {
		const baseActions = [
			{
				name: 'Home',
				href: '/',
				icon: Home,
				description: 'Voltar à página inicial',
			},
		]

		if (userRole === 'admin' || userRole === 'master') {
			return [
				...baseActions,
				{
					name: 'Dashboard',
					href: '/dashboard',
					icon: Settings,
					description: 'Painel administrativo',
				},
				{
					name: 'Gerenciar Menu',
					href: '/dashboard/menu',
					icon: FileText,
					description: 'Gerenciar cardápio',
				},
			]
		}

		return [
			...baseActions,
			{
				name: 'Menu',
				href: '/menu',
				icon: FileText,
				description: 'Ver cardápio',
			},
			{
				name: 'Perfil',
				href: '/profile',
				icon: User,
				description: 'Gerenciar conta',
			},
		]
	}, [userRole])

	return (
		<div className="min-h-screen bg-background">
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div
					className={`max-w-2xl w-full text-center transition-all duration-500 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}
				>
					{/* Logo and Theme Toggle - aligned */}
					<div className="flex items-center justify-between mb-8">
						<div className="flex-1" /> {/* Spacer for centering */}
						<div className="flex-1 flex justify-center">
							<AuthHero />
						</div>
						<div className="flex-1 flex justify-end">
							<ThemeSwitcher />
						</div>
					</div>

					{/* Main Content */}
					<div className="bg-card rounded-lg border p-8 mb-8">
						{/* Error Message */}
						<div className="mb-8">
							<h1 className="text-3xl font-semibold text-foreground mb-4">
								Página não encontrada
							</h1>
							<p className="text-muted-foreground mb-4">
								A página que você está procurando não existe ou foi movida.
							</p>
						</div>

						{/* Search with Autocomplete */}
						<form onSubmit={handleSearch} className="mb-8">
							<div className="relative max-w-md mx-auto">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
								<input
									type="text"
									placeholder="Buscar páginas..."
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value)
										setShowSuggestions(true)
									}}
									onFocus={() => setShowSuggestions(true)}
									onBlur={() =>
										setTimeout(() => setShowSuggestions(false), 200)
									}
									className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
								/>
								<button
									type="submit"
									className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-all text-sm z-10"
								>
									Buscar
								</button>

								{/* Autocomplete Suggestions */}
								{showSuggestions && suggestions.length > 0 && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
										{suggestions.map((suggestion, index) => (
											<button
												key={suggestion.path}
												type="button"
												onClick={() => handleSuggestionClick(suggestion.path)}
												className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 focus:bg-accent focus:outline-none"
											>
												<div className="font-medium text-foreground text-sm">
													{suggestion.name}
												</div>
												<div className="text-xs text-muted-foreground">
													{suggestion.description}
												</div>
											</button>
										))}
									</div>
								)}
							</div>
						</form>

						{/* Quick Actions */}
						<div className="grid md:grid-cols-3 gap-4 mb-8">
							{quickActions.map((action) => (
								<Link
									key={action.href}
									href={action.href}
									className="p-4 rounded-lg border hover:bg-accent transition-all group"
								>
									<action.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
									<h3 className="font-medium text-foreground mb-1 text-sm">
										{action.name}
									</h3>
									<p className="text-xs text-muted-foreground">
										{action.description}
									</p>
								</Link>
							))}
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onClick={handleGoBack}
								className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all text-sm"
							>
								<ArrowLeft className="w-4 h-4" />
								Voltar
							</button>

							<Link
								href="/"
								className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm"
							>
								<Home className="w-4 h-4" />
								Ir para Home
							</Link>
						</div>
					</div>

					{/* Footer */}
					<div className="text-center">
						<p className="text-xs text-muted-foreground">
							Se você acredita que isso é um erro, entre em contato conosco.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
