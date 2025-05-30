'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import {
	CookieIcon,
	Shield,
	BarChart3,
	Settings,
	Info,
	Trash2,
	Save,
	RotateCcw,
	Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
	cookieManager,
	type CookieCategory,
	type CookiePreferences,
	DEFAULT_PREFERENCES,
} from '@/lib/cookie-manager'
import { toast } from 'sonner'

const COOKIE_CATEGORIES = {
	essential: {
		name: 'Cookies Essenciais',
		description:
			'Necessários para o funcionamento básico do site. Não podem ser desabilitados.',
		icon: Shield,
		required: true,
		examples: [
			'Autenticação de usuário',
			'Segurança da sessão',
			'Consentimento de cookies',
		],
		details:
			'Estes cookies são essenciais para que o site funcione corretamente. Eles incluem funcionalidades como login, autenticação e outras funções básicas de segurança.',
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
		details:
			'Estes cookies coletam informações sobre como você usa nosso site, ajudando-nos a melhorar a experiência do usuário e o desempenho.',
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
			'Personalizações da interface',
		],
		details:
			'Estes cookies lembram suas preferências e configurações para proporcionar uma experiência mais personalizada.',
	},
}

interface CookieSettingsPageProps {
	className?: string
}

export function CookieSettingsPage({ className }: CookieSettingsPageProps) {
	const router = useRouter()
	const [preferences, setPreferences] =
		useState<CookiePreferences>(DEFAULT_PREFERENCES)
	const [hasConsented, setHasConsented] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)
	const [originalPreferences, setOriginalPreferences] =
		useState<CookiePreferences>(DEFAULT_PREFERENCES)

	useEffect(() => {
		const loadCurrentPreferences = () => {
			const currentPrefs = cookieManager.loadPreferences()
			const consented = cookieManager.hasConsented()

			setPreferences(currentPrefs)
			setOriginalPreferences(currentPrefs)
			setHasConsented(consented)
		}

		loadCurrentPreferences()
	}, [])

	useEffect(() => {
		// Check if current preferences differ from original
		const changed =
			JSON.stringify(preferences) !== JSON.stringify(originalPreferences)
		setHasChanges(changed)
	}, [preferences, originalPreferences])

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

	const handleSavePreferences = async () => {
		setIsSaving(true)

		try {
			cookieManager.savePreferences(preferences)
			setOriginalPreferences(preferences)
			setHasConsented(true)

			toast.success('Preferências de cookies salvas com sucesso!')

			// Brief delay to show the saved state
			setTimeout(() => {
				setIsSaving(false)
			}, 500)
		} catch (error) {
			toast.error('Erro ao salvar preferências de cookies')
			console.error('Error saving cookie preferences:', error)
			setIsSaving(false)
		}
	}

	const handleResetToDefaults = () => {
		setPreferences(DEFAULT_PREFERENCES)
		toast.info('Preferências redefinidas para o padrão')
	}

	const handleClearAllCookies = () => {
		cookieManager.clearAllPreferences()
		setPreferences(DEFAULT_PREFERENCES)
		setOriginalPreferences(DEFAULT_PREFERENCES)
		setHasConsented(false)
		toast.success('Todas as preferências de cookies foram removidas')
	}

	const handleGoHome = () => {
		router.push('/')
	}

	const activeCount = Object.values(preferences).filter(Boolean).length
	const totalCount = Object.keys(COOKIE_CATEGORIES).length

	return (
		<div className={cn('max-w-4xl mx-auto space-y-6 px-4 sm:px-0', className)}>
			{/* Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center space-x-3">
						<CookieIcon className="h-8 w-8 text-primary" />
						<div>
							<CardTitle className="text-xl sm:text-2xl">
								Configurações de Cookies
							</CardTitle>
							<CardDescription>
								Gerencie suas preferências de cookies e privacidade
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<p className="text-sm font-medium">
								Status atual: {activeCount} de {totalCount} categorias ativas
							</p>
							<p className="text-xs text-muted-foreground">
								{hasConsented
									? 'Você já deu seu consentimento'
									: 'Nenhum consentimento registrado'}
							</p>
						</div>
						<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
							<Button
								variant="outline"
								size="sm"
								onClick={handleResetToDefaults}
								disabled={isSaving}
								className="w-full sm:w-auto"
							>
								<RotateCcw className="w-4 h-4 mr-2" />
								Redefinir
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={handleClearAllCookies}
								disabled={isSaving}
								className="w-full sm:w-auto"
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Limpar Tudo
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Change Alert */}
			{hasChanges && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>
						Você tem alterações não salvas. Clique em "Salvar Preferências" para
						aplicar as mudanças.
					</AlertDescription>
				</Alert>
			)}

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
								'transition-all duration-200',
								isEnabled && 'ring-2 ring-primary/20 bg-primary/5'
							)}
						>
							<CardContent className="p-6">
								<div className="space-y-4">
									{/* Header */}
									<div className="flex flex-col sm:flex-row items-start justify-between space-y-4 sm:space-y-0 sm:space-x-4">
										<div className="flex-1 space-y-2">
											<div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
												<IconComponent className="h-6 w-6 text-primary" />
												<div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
													<h3 className="text-lg font-semibold">
														{category.name}
													</h3>
													<div className="flex space-x-1">
														{category.required && (
															<Badge variant="secondary" className="text-xs">
																Obrigatório
															</Badge>
														)}
														{isEnabled && !category.required && (
															<Badge variant="default" className="text-xs">
																Ativo
															</Badge>
														)}
													</div>
												</div>
											</div>
											<p className="text-sm text-muted-foreground">
												{category.description}
											</p>
										</div>
										<div className="flex-shrink-0">
											<Switch
												checked={isEnabled}
												onCheckedChange={(checked: boolean) =>
													handlePreferenceChange(categoryKey, checked)
												}
												disabled={category.required}
											/>
										</div>
									</div>

									{/* Details */}
									<div className="space-y-3">
										<p className="text-sm">{category.details}</p>

										{/* Examples */}
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-2">
												Exemplos de uso:
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
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{/* Action Buttons */}
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div className="space-y-1">
							<p className="text-sm font-medium">
								Pronto para salvar suas preferências?
							</p>
							<p className="text-xs text-muted-foreground">
								Suas configurações serão aplicadas imediatamente
							</p>
						</div>
						<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
							<Button
								variant="outline"
								onClick={handleGoHome}
								disabled={isSaving}
								className="flex items-center gap-2 w-full sm:w-auto"
							>
								<Home className="w-4 h-4" />
								Início
							</Button>
							<Button
								onClick={handleSavePreferences}
								disabled={!hasChanges || isSaving}
								className="bg-gradient-to-r from-[#ED2152] to-[#C71585] w-full sm:w-auto"
							>
								{isSaving ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
										Salvando...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2" />
										Salvar Preferências
									</>
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Additional Information */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Informações Adicionais</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-sm space-y-2">
						<p>
							<strong>Como os cookies são usados:</strong> Os cookies nos ajudam
							a fornecer, proteger e melhorar nossos serviços, personalizar
							conteúdo e anúncios.
						</p>
						<p>
							<strong>Seus direitos:</strong> Você pode alterar suas
							preferências de cookies a qualquer momento revisitando esta
							página. Alguns cookies são essenciais para o funcionamento do
							site.
						</p>
						<p>
							<strong>Mais informações:</strong> Para saber mais sobre como
							processamos seus dados, consulte nossa{' '}
							<a href="#" className="text-primary underline">
								Política de Privacidade
							</a>
							.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default CookieSettingsPage
