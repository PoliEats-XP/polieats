'use client'

import { useState, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { ProfileDialog } from './profile-dialog'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMediaQuery, useIsMounted } from '@/hooks'

export function AvatarDropdown() {
	const router = useRouter()
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isMobile, setIsMobile] = useState<boolean | null>(null)

	const isMounted = useIsMounted()
	const mediaQueryResult = useMediaQuery('(max-width: 767px)')

	const { data } = authClient.useSession()
	const session = data

	useEffect(() => {
		if (isMounted()) {
			setIsMobile(mediaQueryResult)
		}
	}, [mediaQueryResult, isMounted])

	async function logout() {
		await authClient.signOut()

		toast.success(
			'Logout realizado com sucesso! Redirecionando para a página de login.'
		)

		setTimeout(() => {
			router.push('/login')
		}, 3000)
	}

	// Handle mobile direct tap
	const handleMobileAvatarClick = () => {
		setIsDialogOpen(true)
	}

	// Don't render until we know if it's mobile or not
	if (!isMounted() || isMobile === null) {
		return (
			<Avatar>
				<AvatarImage
					src={
						session?.user.image ||
						'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
					}
				/>
				<AvatarFallback>GB</AvatarFallback>
			</Avatar>
		)
	}

	// Mobile version - direct tap opens profile
	if (isMobile) {
		return (
			<>
				<Avatar className="cursor-pointer" onClick={handleMobileAvatarClick}>
					<AvatarImage
						src={
							session?.user.image ||
							'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
						}
					/>
					<AvatarFallback>GB</AvatarFallback>
				</Avatar>
				<ProfileDialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					showLogoutInProfile={true}
					onLogout={logout}
				/>
			</>
		)
	}

	// Desktop version - dropdown menu
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger className="cursor-pointer">
					<Avatar>
						<AvatarImage
							src={
								session?.user.image ||
								'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
							}
						/>
						<AvatarFallback>GB</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="mr-4 p-2">
					<DropdownMenuLabel>Minha conta</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="flex items-center gap-4 cursor-pointer"
						onClick={() => setIsDialogOpen(true)}
					>
						<User />
						<span className="text-sm">Perfil</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="flex items-center gap-4 cursor-pointer"
						onClick={logout}
					>
						<LogOut className="text-destructive" />
						<span className="text-sm text-destructive">Sair</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ProfileDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
		</>
	)
}
