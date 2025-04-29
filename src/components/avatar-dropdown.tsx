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

export function AvatarDropdown() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Avatar>
					<AvatarImage src="https://github.com/gbrasil720.png" />
					<AvatarFallback>GB</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="mr-4 p-2">
				<DropdownMenuLabel>Minha conta</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="flex items-center gap-4 cursor-pointer">
					<User />
					<span className="text-sm">Perfil</span>
				</DropdownMenuItem>
				<DropdownMenuItem className="flex items-center gap-4 cursor-pointer">
					<LogOut className="text-destructive" />
					<span className="text-sm text-destructive">Sair</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
