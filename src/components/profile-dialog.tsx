'use client'

import { Dialog, DialogContent, DialogFooter, DialogTitle } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'
import { IconInput } from './icon-input'
import { AtSign, KeyRound, User } from 'lucide-react'

type ProfileDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
	const { data } = authClient.useSession()
	const session = data

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="">
				<DialogTitle>Perfil</DialogTitle>
				<div className="flex items-center justify-between">
					<div className="flex items-center flex-col gap-2">
						<Avatar className="size-36">
							<AvatarImage
								src={session?.user.image || 'https://github.com/gbrasil720.png'}
							/>
							<AvatarFallback>GB</AvatarFallback>
						</Avatar>
						<p>Editar</p>
					</div>
					<div className="flex flex-col items-center gap-5">
						<IconInput
							LeftIcon={User}
							disabled
							className="w-64 text-[2px]"
							inputValue={session?.user.name || ''}
						/>
						<IconInput
							LeftIcon={AtSign}
							disabled
							className="w-64 text-[2px]"
							inputValue={session?.user.email || ''}
						/>
						<IconInput
							LeftIcon={KeyRound}
							disabled
							className="w-64"
							placeholder="*******"
						/>
					</div>
				</div>
				<DialogFooter className="mt-16">
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
	)
}
