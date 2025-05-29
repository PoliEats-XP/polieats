'use client'

import { Dialog, DialogContent, DialogFooter, DialogTitle } from './ui/dialog'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerFooter,
} from './ui/drawer'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { authClient } from '@/lib/auth-client'
import { IconInput } from './icon-input'
import {
	AtSign,
	KeyRound,
	User,
	Copy,
	Check,
	Settings,
	Calendar,
	Clock,
	Shield,
	Moon,
	Sun,
	Monitor,
	LogOut,
	CookieIcon,
	ExternalLink,
	BarChart3,
} from 'lucide-react'
import { EditUserImageDialog } from './edit-user-image-dialog'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useMediaQuery, useIsMounted } from '@/hooks'
import {
	cookieManager,
	type CookieCategory,
	type CookiePreferences,
	DEFAULT_PREFERENCES,
} from '@/lib/cookie-manager'

type ProfileDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [copiedEmail, setCopiedEmail] = useState(false)
	const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile')
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
	const [cookiePreferences, setCookiePreferences] =
		useState<CookiePreferences>(DEFAULT_PREFERENCES)
	const { theme, setTheme } = useTheme()

	const isMounted = useIsMounted()
	const mediaQueryResult = useMediaQuery('(min-width: 768px)')

	const { data } = authClient.useSession()
	const session = data

	// Function to refresh cookie preferences
	const refreshCookiePreferences = () => {
		const currentPrefs = cookieManager.loadPreferences()
		setCookiePreferences(currentPrefs)
	}

	useEffect(() => {
		if (isMounted()) {
			setIsDesktop(mediaQueryResult)
			refreshCookiePreferences()
		}
	}, [mediaQueryResult, isMounted])

	// Refresh cookie preferences when dialog opens
	useEffect(() => {
		if (open) {
			refreshCookiePreferences()
		}
	}, [open])

	// Listen for focus events to refresh preferences when returning from cookie settings
	useEffect(() => {
		const handleFocus = () => {
			if (open) {
				refreshCookiePreferences()
			}
		}

		window.addEventListener('focus', handleFocus)
		return () => window.removeEventListener('focus', handleFocus)
	}, [open])

	// Subscribe to cookie preference changes from other components
	useEffect(() => {
		const unsubscribe = cookieManager.onPreferencesChange((newPreferences) => {
			if (open) {
				setCookiePreferences(newPreferences)
			}
		})

		return unsubscribe
	}, [open])

	function openEditDialog() {
		onOpenChange?.(false)
		setIsEditDialogOpen(true)
	}

	function closeEditDialog() {
		setIsEditDialogOpen(false)
		onOpenChange?.(true)
	}

	async function copyEmail() {
		if (session?.user.email) {
			try {
				await navigator.clipboard.writeText(session.user.email)
				setCopiedEmail(true)
				toast.success('Email copiado para a área de transferência!')
				setTimeout(() => setCopiedEmail(false), 2000)
			} catch (error) {
				toast.error('Erro ao copiar email')
			}
		}
	}

	function handleSignOut() {
		authClient.signOut()
		onOpenChange?.(false)
		toast.success('Logout realizado com sucesso!')
	}

	function handleCookiePreferenceChange(
		category: CookieCategory,
		enabled: boolean
	) {
		if (category === 'essential') return // Can't disable essential cookies

		const newPreferences = {
			...cookiePreferences,
			[category]: enabled,
		}

		setCookiePreferences(newPreferences)
		cookieManager.savePreferences(newPreferences)
		toast.success(
			`Preferência de ${category} ${enabled ? 'ativada' : 'desativada'}`
		)
	}

	function openCookieSettings() {
		// This could open a full cookie settings page or dialog
		window.open('/cookie-settings', '_blank')
	}

	const joinDate = session?.user.createdAt
		? new Date(session.user.createdAt).toLocaleDateString('pt-BR', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		: 'Data não disponível'

	const lastLogin = session?.user.updatedAt
		? new Date(session.user.updatedAt).toLocaleDateString('pt-BR', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		: 'Não disponível'

	// Tab Navigation Component
	const TabNavigation = () => (
		<div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
			<button
				onClick={() => setActiveTab('profile')}
				className={cn(
					'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
					activeTab === 'profile'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				<User className="w-4 h-4 inline mr-2" />
				Perfil
			</button>
			<button
				onClick={() => setActiveTab('settings')}
				className={cn(
					'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
					activeTab === 'settings'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				<Settings className="w-4 h-4 inline mr-2" />
				Configurações
			</button>
		</div>
	)

	// Profile Content Component
	const ProfileContent = () => (
		<div className="space-y-6">
			{/* Profile Header */}
			<div className="flex items-start gap-6 flex-col md:flex-row">
				<div className="flex flex-col items-center gap-3 w-full md:w-auto">
					<Avatar className="size-32 ring-4 ring-primary/10">
						<AvatarImage
							src={
								session?.user.image ||
								'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
							}
						/>
						<AvatarFallback className="text-2xl">
							{session?.user.name?.charAt(0)?.toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>
					<Button
						onClick={() => openEditDialog()}
						variant="outline"
						size="sm"
						className="cursor-pointer"
					>
						Editar Foto
					</Button>
				</div>

				<div className="flex-1 space-y-4 w-full">
					<div className="text-center md:text-left">
						<h3 className="text-xl font-semibold mb-1">
							{session?.user.name || 'Nome não disponível'}
						</h3>
						<p className="text-muted-foreground">Membro desde {joinDate}</p>
					</div>

					{/* User Info Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="bg-muted/50 rounded-lg p-3">
							<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
								<Calendar className="w-4 h-4" />
								Membro desde
							</div>
							<p className="font-medium">{joinDate}</p>
						</div>
						<div className="bg-muted/50 rounded-lg p-3">
							<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
								<Clock className="w-4 h-4" />
								Último acesso
							</div>
							<p className="font-medium">{lastLogin}</p>
						</div>
					</div>
				</div>
			</div>

			{/* User Details */}
			<div className="space-y-4">
				<h4 className="text-lg font-medium flex items-center gap-2">
					<Shield className="w-5 h-5" />
					Informações da Conta
				</h4>

				<div className="space-y-3">
					<div>
						<label
							htmlFor="profile-name"
							className="text-sm font-medium text-muted-foreground mb-2 block"
						>
							Nome completo
						</label>
						<IconInput
							id="profile-name"
							LeftIcon={User}
							disabled
							className="w-full"
							inputValue={session?.user.name || ''}
						/>
					</div>

					<div>
						<label
							htmlFor="profile-email"
							className="text-sm font-medium text-muted-foreground mb-2 block"
						>
							Email
						</label>
						<div className="relative">
							<IconInput
								id="profile-email"
								LeftIcon={AtSign}
								disabled
								className="w-full pr-12"
								inputValue={session?.user.email || ''}
							/>
							<Button
								onClick={copyEmail}
								variant="ghost"
								size="icon"
								className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
							>
								{copiedEmail ? (
									<Check className="w-4 h-4 text-green-500" />
								) : (
									<Copy className="w-4 h-4" />
								)}
							</Button>
						</div>
					</div>

					<div>
						<label
							htmlFor="profile-password"
							className="text-sm font-medium text-muted-foreground mb-2 block"
						>
							Senha
						</label>
						<IconInput
							id="profile-password"
							LeftIcon={KeyRound}
							disabled
							className="w-full"
							placeholder="••••••••"
						/>
					</div>
				</div>
			</div>
		</div>
	)

	// Settings Content Component
	const SettingsContent = () => (
		<div className="space-y-6">
			<h4 className="text-lg font-medium">Configurações da Conta</h4>

			{/* Theme Settings */}
			<div className="space-y-3">
				<h5 className="font-medium">Tema da Aplicação</h5>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<Button
						onClick={() => setTheme('light')}
						variant={theme === 'light' ? 'default' : 'outline'}
						className="flex items-center gap-2 h-12"
					>
						<Sun className="w-4 h-4" />
						Claro
					</Button>
					<Button
						onClick={() => setTheme('dark')}
						variant={theme === 'dark' ? 'default' : 'outline'}
						className="flex items-center gap-2 h-12"
					>
						<Moon className="w-4 h-4" />
						Escuro
					</Button>
					<Button
						onClick={() => setTheme('system')}
						variant={theme === 'system' ? 'default' : 'outline'}
						className="flex items-center gap-2 h-12"
					>
						<Monitor className="w-4 h-4" />
						Sistema
					</Button>
				</div>
			</div>

			{/* Account Actions */}
			<div className="space-y-3">
				<h5 className="font-medium">Ações da Conta</h5>
				<div className="space-y-2">
					<Button
						onClick={handleSignOut}
						variant="destructive"
						className="w-full justify-start"
					>
						<LogOut className="w-4 h-4 mr-2" />
						Sair da Conta
					</Button>
				</div>
			</div>

			{/* Account Info */}
			<div className="bg-muted/50 rounded-lg p-4 space-y-2">
				<h5 className="font-medium">Informações da Sessão</h5>
				<div className="text-sm text-muted-foreground space-y-1">
					<p>ID da Sessão: {session?.session?.id || 'N/A'}</p>
					<p>
						Expira em:{' '}
						{session?.session?.expiresAt
							? new Date(session.session.expiresAt).toLocaleDateString('pt-BR')
							: 'N/A'}
					</p>
				</div>
			</div>

			{/* Cookie Settings */}
			<div className="space-y-3">
				<h5 className="font-medium flex items-center gap-2">
					<CookieIcon className="w-4 h-4" />
					Configurações de Cookies
				</h5>

				{/* Cookie Summary */}
				<div className="bg-muted/50 rounded-lg p-3 space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium">Status atual</span>
						<div className="flex gap-1">
							{Object.entries(cookiePreferences).map(([key, enabled]) => (
								<Badge
									key={key}
									variant={enabled ? 'default' : 'outline'}
									className="text-xs"
								>
									{key === 'essential'
										? 'Essenciais'
										: key === 'analytics'
											? 'Análise'
											: 'Funcionais'}
								</Badge>
							))}
						</div>
					</div>

					{/* Quick Cookie Controls */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<BarChart3 className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">Cookies de Análise</span>
							</div>
							<Switch
								checked={cookiePreferences.analytics}
								onCheckedChange={(checked) =>
									handleCookiePreferenceChange('analytics', checked)
								}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Settings className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">Cookies Funcionais</span>
							</div>
							<Switch
								checked={cookiePreferences.functional}
								onCheckedChange={(checked) =>
									handleCookiePreferenceChange('functional', checked)
								}
							/>
						</div>
					</div>
				</div>

				<Button
					onClick={openCookieSettings}
					variant="outline"
					className="w-full justify-between"
				>
					<span className="flex items-center">
						<CookieIcon className="w-4 h-4 mr-2" />
						Configurações Avançadas
					</span>
					<ExternalLink className="w-4 h-4" />
				</Button>
			</div>
		</div>
	)

	// Loading state while determining device type
	if (!isMounted() || isDesktop === null) {
		return null
	}

	// Desktop Dialog
	if (isDesktop) {
		return (
			<>
				<Dialog onOpenChange={onOpenChange} open={open}>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogTitle className="text-2xl font-semibold">
							Perfil do Usuário
						</DialogTitle>

						<TabNavigation />

						{activeTab === 'profile' && <ProfileContent />}
						{activeTab === 'settings' && <SettingsContent />}

						<DialogFooter className="mt-8">
							<Button
								variant="outline"
								className="px-6 rounded-sm cursor-pointer"
								onClick={() => onOpenChange?.(false)}
							>
								Fechar
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<EditUserImageDialog
					open={isEditDialogOpen}
					onOpenChange={openEditDialog}
					onClose={closeEditDialog}
				/>
			</>
		)
	}

	// Mobile Drawer
	return (
		<>
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className="max-h-[95vh]">
					<DrawerHeader className="pb-4">
						<DrawerTitle className="text-2xl font-semibold">
							Perfil do Usuário
						</DrawerTitle>
					</DrawerHeader>

					<div className="px-4 overflow-y-auto flex-1">
						<TabNavigation />

						{activeTab === 'profile' && <ProfileContent />}
						{activeTab === 'settings' && <SettingsContent />}
					</div>

					<DrawerFooter className="pt-4">
						<Button
							variant="outline"
							className="w-full cursor-pointer"
							onClick={() => onOpenChange?.(false)}
						>
							Fechar
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
			<EditUserImageDialog
				open={isEditDialogOpen}
				onOpenChange={openEditDialog}
				onClose={closeEditDialog}
			/>
		</>
	)
}
