'use client'

import { Dialog, DialogContent, DialogFooter, DialogTitle } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { NameInput } from './auth/name-input'
import { EmailInput } from './auth/email-input'
import { PasswordInput } from './auth/password-input'
import { Button } from './ui/button'

type ProfileDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="">
				<DialogTitle>Perfil</DialogTitle>
				<div className="flex items-center justify-between">
					<div className="flex items-center flex-col gap-2">
						<Avatar className="size-36">
							<AvatarImage src="https://github.com/gbrasil720.png" />
							<AvatarFallback>GB</AvatarFallback>
						</Avatar>
						<p>Editar</p>
					</div>
					<div className="flex flex-col items-center gap-5">
						<NameInput disabled className="w-64" />
						<EmailInput disabled className="w-64" />
						<PasswordInput disabled placeholder="********" className="w-64" />
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
