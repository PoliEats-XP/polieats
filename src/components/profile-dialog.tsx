'use client'

import { Dialog, DialogContent, DialogFooter, DialogTitle } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'
import { IconInput } from './icon-input'
import { AtSign, KeyRound, User } from 'lucide-react'
import { EditUserImageDialog } from './edit-user-image-dialog'
import { useState } from 'react'

type ProfileDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

	const { data } = authClient.useSession()
	const session = data

	function openEditDialog() {
		onOpenChange?.(false)
		setIsEditDialogOpen(true)
	}

	function closeEditDialog() {
		setIsEditDialogOpen(false)
		onOpenChange?.(true)
	}

	return (
		<>
			<Dialog onOpenChange={onOpenChange} open={open}>
				<DialogContent className="">
					<DialogTitle>Perfil</DialogTitle>
					<div className="flex items-center justify-between">
						<div className="flex items-center flex-col gap-2">
							<Avatar className="size-36">
								<AvatarImage
									src={
										session?.user.image ||
										'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
									}
								/>
								<AvatarFallback>GB</AvatarFallback>
							</Avatar>
							<Button
								onClick={() => openEditDialog()}
								variant="outline"
								className="cursor-pointer"
							>
								Editar
							</Button>
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
			<EditUserImageDialog
				open={isEditDialogOpen}
				onOpenChange={openEditDialog}
				onClose={closeEditDialog}
			/>
		</>
	)
}
