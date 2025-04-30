'use client'

import { useState } from 'react'
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

export function AvatarDropdown() {
	const router = useRouter()
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const { data } = authClient.useSession()
	const session = data

	async function logout() {
		await authClient.signOut()

		toast.success(
			'Logout realizado com sucesso! Redirecionando para a página de login.'
		)

		setTimeout(() => {
			router.push('/login')
		}, 3000)
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger className="cursor-pointer">
					<Avatar>
						<AvatarImage src={session?.user.image || ''} />
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
