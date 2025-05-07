import { useIsMounted, useMediaQuery } from '@/hooks'
import type { itemFormSchema } from '@/lib/schemas/menu.schemas'
import { addItemMutation, deleteItemMutation } from '@/utils/mutations'
import { useStore } from '@/utils/store'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { z } from 'zod'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { ItemForm } from './item-form'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer'

type AddItemProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function AddItem({ open, onOpenChange }: AddItemProps) {
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
	const isMounted = useIsMounted()
	const mediaQueryResult = useMediaQuery('(min-width: 768px)')

	const queryClient = useQueryClient()
	const isEditing = useStore((state) => state.isEditing)

	useEffect(() => {
		if (isMounted()) {
			setIsDesktop(mediaQueryResult)
		}
	}, [mediaQueryResult, isMounted])

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

	if (isDesktop) {
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

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<div className="flex justify-center px-2 sm:px-4 md:px-0">
				<DrawerContent
					className="w-full max-w-md
                                 border-x border-b
                                 rounded-t-lg sm:rounded-lg
                                 p-4 sm:p-6 md:p-8"
				>
					<DrawerHeader className="flex flex-col gap-1 text-2xl font-medium p-0 pt-6">
						<DrawerTitle className="flex flex-col gap-1 text-2xl font-medium p-0 px-0 pt-6">
							Adicionar item
						</DrawerTitle>
						<p className="text-lg font-light text-black dark:text-white -mt-2 pb-6">
							Adicione um novo item ao cardápio
						</p>
					</DrawerHeader>
					<ItemForm onSubmit={onSubmit} onOpenChange={onOpenChange} />
				</DrawerContent>
			</div>
		</Drawer>
	)
}
