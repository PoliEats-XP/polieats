'use client'

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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { addMenuItem } from '@/utils/add-menu-item'
import { deleteMenuItem } from '@/utils/delete-menu-item'

type AddItemDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

interface ItemProps {
	id: string
	name: string
	quantity: number
	price: number
}

type MenuItem = z.infer<typeof itemFormSchema>

export function AddItemDialog({ onOpenChange, open }: AddItemDialogProps) {
	const queryClient = useQueryClient()

	const addMutation = useMutation({
		mutationFn: addMenuItem,
		onMutate: async (newItem: MenuItem) => {
			console.log('Optimistic update: Adding item', newItem)
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ['menu'] })

			// Snapshot the previous value
			const previousMenu = queryClient.getQueryData(['menu'])

			// Optimistically update the menu
			queryClient.setQueryData(['menu'], (old: MenuItem[] | undefined) => {
				const tempId = nanoid()
				const updatedMenu = [...(old || []), { ...newItem, id: tempId }]
				console.log('Updated menu:', updatedMenu)
				return updatedMenu
			})

			// Close the dialog
			onOpenChange?.(false)

			// Return context with the previous menu
			return { previousMenu }
		},
		onError: (err, newItem, context) => {
			console.error('Mutation error:', err)
			// Roll back to the previous menu on error
			queryClient.setQueryData(['menu'], context?.previousMenu)
		},
		onSuccess: (data) => {
			console.log('Mutation success:', data)
		},
		onSettled: () => {
			console.log('Invalidating menu query')
			// Invalidate to refetch the menu
			queryClient.invalidateQueries({ queryKey: ['menu'] })
		},
	})

	// on item add
	async function onSubmitInclude(values: z.infer<typeof itemFormSchema>) {
		console.log(values)

		addMutation.mutate(values)
	}

	const deleteMutation = useMutation({
		mutationFn: deleteMenuItem,
		onMutate: async (id: string) => {
			console.log('Optimistic update: Deleting item with id', id)
			await queryClient.cancelQueries({ queryKey: ['menu'] })
			const previousMenu = queryClient.getQueryData(['menu'])
			queryClient.setQueryData(['menu'], (old: ItemProps[] | undefined) => {
				const updatedMenu = (old || []).filter((item) => item.id !== id)
				console.log('Updated menu (delete):', updatedMenu)
				return updatedMenu
			})
			onOpenChange?.(false)
			return { previousMenu }
		},
		onError: (err, id, context) => {
			console.error('Delete mutation error:', err)
			queryClient.setQueryData(['menu'], context?.previousMenu)
		},
		onSuccess: (data) => {
			console.log('Delete mutation success:', data)
		},
		onSettled: () => {
			console.log('Invalidating menu query (delete)')
			queryClient.invalidateQueries({ queryKey: ['menu'] })
		},
	})

	// on item delete
	async function onSubmitDelete(values: z.infer<typeof itemFormSchema>) {
		console.log('Submitting item for delete:', values)
		if (!values.id) {
			console.error('No ID provided for deletion')
			return
		}
		deleteMutation.mutate(values.id)
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
				<ItemForm
					onSubmitDelete={onSubmitDelete}
					onSubmitInclude={onSubmitInclude}
					onOpenChange={onOpenChange}
				/>
			</DialogContent>
		</Dialog>
	)
}
