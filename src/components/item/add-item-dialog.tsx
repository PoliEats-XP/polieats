import type { itemFormSchema } from '@/lib/schemas/menu.schemas'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { ItemForm } from './add-item-form'
import type { z } from 'zod'

type AddItemDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function AddItemDialog({ onOpenChange, open }: AddItemDialogProps) {
	async function onSubmit(values: z.infer<typeof itemFormSchema>) {}

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-2xl font-medium">
						Adicionar item
					</DialogTitle>
					<DialogDescription className="text-lg font-light">
						Adicione um novo item ao cardápio
					</DialogDescription>
				</DialogHeader>
				<ItemForm onSubmit={onSubmit} onOpenChange={onOpenChange} />
			</DialogContent>
		</Dialog>
	)
}
