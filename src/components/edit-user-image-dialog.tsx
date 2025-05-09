'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GradientButton } from './gradient-button'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'

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

	async function handleUpdateUserImage() {
		setLoading(true)

		await authClient.updateUser({
			image: imageInputValue,
		})

		setLoading(false)

		toast.success('Imagem atualizada com sucesso!')
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Atualize sua foto</DialogTitle>
					<DialogDescription>
						Para atualizar sua foto, cole o link da nova imagem e clique em
						salvar.
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center space-x-2">
					<div className="grid flex-1 gap-2">
						<Label htmlFor="link" className="sr-only">
							Link da imagem
						</Label>
						<Input
							id="link"
							placeholder="https://imagem.com/imagem.png"
							onChange={(e) => setImageInputValue(e.target.value)}
							value={imageInputValue}
						/>
					</div>
				</div>
				<div className="flex items-center justify-between gap-2">
					<GradientButton
						variant="filled"
						className="w-[25%] text-center cursor-pointer"
						onClick={handleUpdateUserImage}
						disabled={loading || !imageInputValue}
						loading={loading}
					>
						Salvar
					</GradientButton>
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer"
						onClick={() => onClose()}
					>
						Fechar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
