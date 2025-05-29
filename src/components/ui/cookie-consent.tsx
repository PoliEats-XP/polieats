'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Button } from './button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './card'
import { Switch } from './switch'
import { Separator } from './separator'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './dialog'
import { Badge } from './badge'
import { CookieIcon, Settings, Shield, BarChart3, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
	cookieManager,
	type CookieCategory,
	type CookiePreferences,
	DEFAULT_PREFERENCES,
} from '@/lib/cookie-manager'

interface CookieConsentProps {
	variant?: 'default' | 'small'
	demo?: boolean
	onAcceptCallback?: (preferences: CookiePreferences) => void
	onDeclineCallback?: () => void
	onPreferencesChange?: (preferences: CookiePreferences) => void
}

const COOKIE_CATEGORIES = {
	essential: {
		name: 'Cookies Essenciais',
		description:
			'Necessários para o funcionamento básico do site. Não podem ser desabilitados.',
		icon: Shield,
		required: true,
		examples: [
			'Autenticação',
			'Segurança da sessão',
			'Consentimento de cookies',
		],
	},
	analytics: {
		name: 'Cookies de Análise',
		description:
			'Nos ajudam a entender como você usa o site para melhorar a experiência.',
		icon: BarChart3,
		required: false,
		examples: [
			'Google Analytics',
			'Métricas de performance',
			'Análise de comportamento',
		],
	},
	functional: {
		name: 'Cookies Funcionais',
		description:
			'Permitem funcionalidades avançadas e personalização da experiência.',
		icon: Settings,
		required: false,
		examples: [
			'Preferências de tema',
			'Configurações de idioma',
			'Personalização da UI',
		],
	},
}

export default function CookieConsent({
	variant = 'default',
	demo = false,
	onAcceptCallback = () => {},
	onDeclineCallback = () => {},
	onPreferencesChange = () => {},
}: CookieConsentProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)
	const [hide, setHide] = useState(false)
	const [preferences, setPreferences] =
		useState<CookiePreferences>(DEFAULT_PREFERENCES)
	const [isAnimating, setIsAnimating] = useState(false)

	// Memoize the callback to prevent useEffect loop
	const memoizedOnPreferencesChange = useCallback(onPreferencesChange, [])

	const handleAcceptAll = () => {
		const allAccepted: CookiePreferences = {
			essential: true,
			analytics: true,
			functional: true,
		}

		cookieManager.savePreferences(allAccepted)
		setPreferences(allAccepted)
		onAcceptCallback(allAccepted)
		memoizedOnPreferencesChange(allAccepted)
		closeConsent()
	}

	const handleAcceptSelected = () => {
		cookieManager.savePreferences(preferences)
		onAcceptCallback(preferences)
		memoizedOnPreferencesChange(preferences)
		setIsSettingsOpen(false)
		closeConsent()
	}

	const handleDeclineAll = () => {
		const essentialOnly: CookiePreferences = {
			essential: true,
			analytics: false,
			functional: false,
		}

		cookieManager.savePreferences(essentialOnly)
		setPreferences(essentialOnly)
		onDeclineCallback()
		memoizedOnPreferencesChange(essentialOnly)
		closeConsent()
	}

	const closeConsent = () => {
		setIsAnimating(true)
		setIsOpen(false)
		setTimeout(() => {
			setHide(true)
			setIsAnimating(false)
		}, 300)
	}

	const handlePreferenceChange = (
		category: CookieCategory,
		enabled: boolean
	) => {
		if (category === 'essential') return // Can't disable essential cookies

		setPreferences((prev) => ({
			...prev,
			[category]: enabled,
		}))
	}

	const openSettings = () => {
		setIsSettingsOpen(true)
		// Close the main consent banner when opening settings
		setIsOpen(false)
	}

	useEffect(() => {
		if (demo) {
			setIsOpen(true)
			return
		}

		const hasUserConsented = cookieManager.hasConsented()
		if (!hasUserConsented) {
			setIsOpen(true)
		} else {
			// Load existing preferences
			const savedPrefs = cookieManager.loadPreferences()
			setPreferences(savedPrefs)
			memoizedOnPreferencesChange(savedPrefs)
			setHide(true)
		}
	}, [demo, memoizedOnPreferencesChange])

	const activeCount = Object.values(preferences).filter(Boolean).length

	if (hide && !demo) return null

	return (
		<>
			{/* Main Cookie Consent Banner */}
			<div
				className={cn(
					'fixed z-[200] bottom-0 left-0 right-0 sm:left-4 sm:bottom-4 w-full sm:max-w-lg transition-all duration-300 ease-in-out',
					!isOpen && !isAnimating
						? 'translate-y-full opacity-0 pointer-events-none'
						: 'translate-y-0 opacity-100',
					hide && 'hidden'
				)}
			>
				<Card className="m-3 shadow-2xl border-2">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<CookieIcon className="h-6 w-6 text-primary" />
								<CardTitle className="text-lg">Cookies & Privacidade</CardTitle>
							</div>
							{demo && (
								<Button
									variant="ghost"
									size="sm"
									onClick={closeConsent}
									className="h-6 w-6 p-0"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</CardHeader>

					<CardContent className="space-y-4">
						<CardDescription className="text-sm leading-relaxed">
							Usamos cookies para melhorar sua experiência, analisar o tráfego
							do site e personalizar o conteúdo. Você pode escolher quais tipos
							de cookies aceitar.
						</CardDescription>

						{/* Cookie Categories Preview */}
						<div className="flex flex-wrap gap-1">
							{Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
								const isActive = preferences[key as CookieCategory]
								// Extract meaningful part of category name
								const displayName = category.name.replace(
									/^Cookies\s+(de\s+)?/,
									''
								)
								return (
									<Badge
										key={key}
										variant={isActive ? 'default' : 'outline'}
										className="text-xs transition-colors"
									>
										{displayName}
									</Badge>
								)
							})}
						</div>

						<Separator />

						{/* Action Buttons */}
						<div className="flex flex-col space-y-2">
							<div className="flex space-x-2">
								<Button
									onClick={handleAcceptAll}
									className="flex-1 bg-gradient-to-r from-[#ED2152] to-[#C71585]"
									size="sm"
								>
									Aceitar Todos
								</Button>
								<Button
									onClick={handleDeclineAll}
									variant="outline"
									className="flex-1"
									size="sm"
								>
									Apenas Essenciais
								</Button>
							</div>
							<Button
								onClick={openSettings}
								variant="ghost"
								size="sm"
								className="w-full"
							>
								<Settings className="w-4 h-4 mr-2" />
								Personalizar Cookies
							</Button>
						</div>

						<p className="text-xs text-muted-foreground text-center">
							Atualmente: {activeCount} de{' '}
							{Object.keys(COOKIE_CATEGORIES).length} categorias ativas
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Cookie Settings Modal */}
			<Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center space-x-2">
							<Settings className="h-5 w-5" />
							<span>Configurações de Cookies</span>
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6">
						<p className="text-sm text-muted-foreground">
							Escolha quais tipos de cookies você deseja aceitar. Cookies
							essenciais são sempre necessários para o funcionamento básico do
							site.
						</p>

						{/* Cookie Categories */}
						<div className="space-y-4">
							{Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
								const categoryKey = key as CookieCategory
								const IconComponent = category.icon
								const isEnabled = preferences[categoryKey]

								return (
									<Card
										key={key}
										className={cn(
											'transition-all',
											isEnabled && 'ring-2 ring-primary/20'
										)}
									>
										<CardContent className="p-4">
											<div className="flex items-start justify-between space-x-4">
												<div className="flex-1 space-y-2">
													<div className="flex items-center space-x-3">
														<IconComponent className="h-5 w-5 text-primary" />
														<h3 className="font-medium flex items-center space-x-2">
															{category.name}
															{category.required && (
																<Badge variant="secondary" className="text-xs">
																	Obrigatório
																</Badge>
															)}
														</h3>
													</div>
													<p className="text-sm text-muted-foreground">
														{category.description}
													</p>
													<div className="flex flex-wrap gap-1">
														{category.examples.map((example, index) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs"
															>
																{example}
															</Badge>
														))}
													</div>
												</div>
												<Switch
													checked={isEnabled}
													onCheckedChange={(checked: boolean) =>
														handlePreferenceChange(categoryKey, checked)
													}
													disabled={category.required}
												/>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>

						<Separator />

						{/* Action Buttons */}
						<div className="flex justify-between space-x-2">
							<Button
								variant="outline"
								onClick={() => setIsSettingsOpen(false)}
							>
								Cancelar
							</Button>
							<div className="space-x-2">
								<Button variant="outline" onClick={handleDeclineAll}>
									Apenas Essenciais
								</Button>
								<Button
									onClick={handleAcceptSelected}
									className="bg-gradient-to-r from-[#ED2152] to-[#C71585]"
								>
									Salvar Preferências
								</Button>
							</div>
						</div>

						<p className="text-xs text-center text-muted-foreground">
							Suas preferências são salvas localmente e podem ser alteradas a
							qualquer momento.
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
