'use client'

import type { itemFormSchema } from '@/lib/schemas/menu.schemas'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { ItemForm } from './item-form'
import type { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { addItemMutation, deleteItemMutation } from '@/utils/mutations'
import { useStore } from '@/utils/store'

type AddItemDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function AddItemDialog({ onOpenChange, open }: AddItemDialogProps) {
	const queryClient = useQueryClient()
	const isEditing = useStore((state) => state.isEditing)

	const { addMutation } = addItemMutation(queryClient, onOpenChange)
	const { deleteMutation } = deleteItemMutation(queryClient, onOpenChange)

	async function onSubmitInclude(values: z.infer<typeof itemFormSchema>) {
		return addMutation.mutate(values)
	}

	async function onSubmitDelete(values: z.infer<typeof itemFormSchema>) {
		if (!values.id) {
			return
		}

		return deleteMutation.mutate(values.id)
	}

	async function onSubmit(values: z.infer<typeof itemFormSchema>) {
		return isEditing ? onSubmitDelete(values) : onSubmitInclude(values)
	}

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
