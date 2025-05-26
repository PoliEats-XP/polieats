'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { GradientButton } from './gradient-button'
import { useState, useEffect, useRef } from 'react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import {
	LoaderCircle,
	Upload,
	Link as LinkIcon,
	Camera,
	Image as ImageIcon,
	X,
	Check,
	AlertCircle,
	RefreshCw,
	Globe,
} from 'lucide-react'
import { useMediaQuery, useIsMounted } from '@/hooks'
import { cn } from '@/lib/utils'

interface EditUserImageDialogProps {
	onClose: () => void
	onOpenChange: (open: boolean) => void
	open: boolean
}

export function EditUserImageDialog({
	onClose,
	onOpenChange,
	open,
}: EditUserImageDialogProps) {
	const [imageInputValue, setImageInputValue] = useState('')
	const [loading, setLoading] = useState(false)
	const [previewUrl, setPreviewUrl] = useState('')
	const [imageError, setImageError] = useState(false)
	const [dragActive, setDragActive] = useState(false)
	const [activeMethod, setActiveMethod] = useState<'url' | 'upload'>('url')
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
	const [imageValidating, setImageValidating] = useState(false)

	const fileInputRef = useRef<HTMLInputElement>(null)
	const isMounted = useIsMounted()
	const mediaQueryResult = useMediaQuery('(min-width: 768px)')

	const { data } = authClient.useSession()
	const session = data

	useEffect(() => {
		if (isMounted()) {
			setIsDesktop(mediaQueryResult)
		}
	}, [mediaQueryResult, isMounted])

	// Validate image URL
	useEffect(() => {
		// biome-ignore lint/complexity/useOptionalChain: <explanation>
		if (imageInputValue && imageInputValue.startsWith('http')) {
			setImageValidating(true)
			setImageError(false)

			const img = new Image()
			img.onload = () => {
				setPreviewUrl(imageInputValue)
				setImageError(false)
				setImageValidating(false)
			}
			img.onerror = () => {
				setImageError(true)
				setPreviewUrl('')
				setImageValidating(false)
			}
			img.src = imageInputValue
		} else if (imageInputValue && !imageInputValue.startsWith('data:')) {
			setPreviewUrl('')
			setImageError(false)
			setImageValidating(false)
		}
	}, [imageInputValue])

	// Handle file upload
	const handleFileUpload = (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('Por favor, selecione apenas arquivos de imagem')
			return
		}

		if (file.size > 5 * 1024 * 1024) {
			// 5MB limit
			toast.error('A imagem deve ter menos de 5MB')
			return
		}

		const reader = new FileReader()
		reader.onload = (e) => {
			const result = e.target?.result as string
			setPreviewUrl(result)
			setImageInputValue(result)
			setImageError(false)
		}
		reader.readAsDataURL(file)
	}

	// Drag and drop handlers
	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true)
		} else if (e.type === 'dragleave') {
			setDragActive(false)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)

		if (e.dataTransfer.files?.[0]) {
			handleFileUpload(e.dataTransfer.files[0])
			setActiveMethod('upload')
		}
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			handleFileUpload(e.target.files[0])
		}
	}

	// Generate random avatar
	const generateRandomAvatar = () => {
		const avatarServices = [
			`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
			`https://api.dicebear.com/7.x/personas/svg?seed=${Math.random()}`,
			`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${Math.random()}`,
		]
		const randomAvatar =
			avatarServices[Math.floor(Math.random() * avatarServices.length)]
		setImageInputValue(randomAvatar)
		setActiveMethod('url')
	}

	async function handleUpdateUserImage() {
		if (!previewUrl && !imageInputValue) {
			toast.error('Por favor, selecione uma imagem')
			return
		}

		setLoading(true)

		try {
			await authClient.updateUser({
				image: imageInputValue,
			})

			setLoading(false)
			toast.success('Imagem atualizada com sucesso!')
			onClose()

			// Reset form
			setImageInputValue('')
			setPreviewUrl('')
			setImageError(false)
			setActiveMethod('url')
		} catch (error) {
			setLoading(false)
			toast.error('Erro ao atualizar imagem. Tente novamente.')
		}
	}

	const handleReset = () => {
		setImageInputValue('')
		setPreviewUrl('')
		setImageError(false)
		setActiveMethod('url')
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	// Content components
	const ImagePreview = () => (
		<div className="flex flex-col items-center gap-4 p-4">
			<div className="relative">
				<Avatar className="size-32 ring-4 ring-primary/10">
					<AvatarImage
						src={previewUrl || session?.user.image || ''}
						alt="Preview"
					/>
					<AvatarFallback className="text-2xl">
						{session?.user.name?.charAt(0)?.toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>
				{imageValidating && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
						<LoaderCircle className="w-6 h-6 animate-spin text-white" />
					</div>
				)}
			</div>

			{previewUrl && (
				<div className="flex items-center gap-2 text-sm text-green-600">
					<Check className="w-4 h-4" />
					Imagem carregada com sucesso
				</div>
			)}

			{imageError && (
				<div className="flex items-center gap-2 text-sm text-red-600">
					<AlertCircle className="w-4 h-4" />
					Erro ao carregar imagem
				</div>
			)}
		</div>
	)

	const MethodSelector = () => (
		<div className="flex space-x-1 bg-muted p-1 rounded-lg mb-4">
			<button
				onClick={() => setActiveMethod('url')}
				className={cn(
					'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2',
					activeMethod === 'url'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				<LinkIcon className="w-4 h-4" />
				URL
			</button>
			<button
				onClick={() => setActiveMethod('upload')}
				className={cn(
					'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2',
					activeMethod === 'upload'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				<Upload className="w-4 h-4" />
				Upload
			</button>
		</div>
	)

	const URLMethod = () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="image-url">URL da Imagem</Label>
				<div className="relative">
					<Input
						id="image-url"
						placeholder="https://exemplo.com/imagem.jpg"
						value={imageInputValue}
						onChange={(e) => setImageInputValue(e.target.value)}
						className={cn(
							imageError && 'border-red-500 focus-visible:ring-red-500'
						)}
					/>
					{imageValidating && (
						<LoaderCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
					)}
				</div>
			</div>

			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={generateRandomAvatar}
					className="flex items-center gap-2"
				>
					<RefreshCw className="w-4 h-4" />
					Avatar Aleatório
				</Button>
			</div>
		</div>
	)

	const UploadMethod = () => (
		<div className="space-y-4">
			<div
				className={cn(
					'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
					dragActive
						? 'border-primary bg-primary/5'
						: 'border-muted-foreground/25',
					'hover:border-primary hover:bg-primary/5'
				)}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
			>
				<div className="flex flex-col items-center gap-4">
					<div className="p-4 rounded-full bg-muted">
						<ImageIcon className="w-8 h-8 text-muted-foreground" />
					</div>
					<div className="space-y-2">
						<p className="text-lg font-medium">Arraste uma imagem aqui</p>
						<p className="text-sm text-muted-foreground">
							ou clique para selecionar
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={(e) => {
							e.stopPropagation()
							fileInputRef.current?.click()
						}}
					>
						Selecionar Arquivo
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileSelect}
						className="hidden"
					/>
				</div>
			</div>
			<p className="text-xs text-muted-foreground text-center">
				Formatos suportados: JPG, PNG, GIF, WebP (máx. 5MB)
			</p>
		</div>
	)

	const ActionButtons = ({ isDrawer = false }) => (
		<div
			className={cn(
				'flex gap-2',
				isDrawer ? 'flex-col' : 'flex-row justify-between'
			)}
		>
			<div className="flex gap-2">
				<GradientButton
					variant="filled"
					className={cn('cursor-pointer px-6', isDrawer ? 'flex-1' : '')}
					onClick={handleUpdateUserImage}
					disabled={loading || (!previewUrl && !imageInputValue) || imageError}
					loading={loading}
				>
					{loading ? 'Salvando...' : 'Salvar'}
				</GradientButton>

				<Button
					type="button"
					variant="outline"
					onClick={handleReset}
					disabled={loading}
					className={cn('cursor-pointer px-6', isDrawer ? 'flex-1' : '')}
				>
					<RefreshCw className="w-4 h-4 mr-2" />
					Limpar
				</Button>
			</div>

			<Button
				type="button"
				variant="outline"
				className={cn('cursor-pointer px-6', isDrawer ? 'w-full' : '')}
				onClick={onClose}
				disabled={loading}
			>
				<X className="w-4 h-4 mr-2" />
				Fechar
			</Button>
		</div>
	)

	// Loading state while determining device type
	if (!isMounted() || isDesktop === null) {
		return null
	}

	// Desktop Dialog
	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ImageIcon className="w-5 h-5" />
							Atualizar Foto do Perfil
						</DialogTitle>
						<DialogDescription>
							Escolha uma nova imagem para seu perfil. Você pode usar uma URL ou
							fazer upload de um arquivo.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						<ImagePreview />
						<MethodSelector />
						{activeMethod === 'url' && <URLMethod />}
						{activeMethod === 'upload' && <UploadMethod />}
						<ActionButtons />
					</div>
				</DialogContent>
			</Dialog>
		)
	}

	// Mobile Drawer
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="max-h-[95vh]">
				<DrawerHeader className="pb-4">
					<DrawerTitle className="flex items-center gap-2">
						<ImageIcon className="w-5 h-5" />
						Atualizar Foto do Perfil
					</DrawerTitle>
					<DrawerDescription>
						Escolha uma nova imagem para seu perfil
					</DrawerDescription>
				</DrawerHeader>

				<div className="px-4 overflow-y-auto flex-1 space-y-6">
					<ImagePreview />
					<MethodSelector />
					{activeMethod === 'url' && <URLMethod />}
					{activeMethod === 'upload' && <UploadMethod />}
				</div>

				<DrawerFooter className="pt-4">
					<ActionButtons isDrawer />
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}
