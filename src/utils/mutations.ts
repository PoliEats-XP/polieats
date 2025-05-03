import { type QueryClient, useMutation } from '@tanstack/react-query'
import { addMenuItem } from './add-menu-item'
import type { itemFormSchema } from '@/lib/schemas/menu.schemas'
import type { z } from 'zod'
import { nanoid } from 'nanoid'
import { deleteMenuItem } from './delete-menu-item'

type MenuItem = z.infer<typeof itemFormSchema>

interface ItemProps {
	id: string
	name: string
	quantity: number
	price: number
}

export function addItemMutation(
	queryClient: QueryClient,
	onOpenChange?: (open: boolean) => void
) {
	const addMutation = useMutation({
		mutationFn: addMenuItem,
		onMutate: async (newItem: MenuItem) => {
			await queryClient.cancelQueries({ queryKey: ['menu'] })

			const previousMenu = queryClient.getQueryData(['menu'])

			queryClient.setQueryData(['menu'], (old: MenuItem[] | undefined) => {
				const tempId = nanoid()
				const updatedMenu = [...(old || []), { ...newItem, id: tempId }]
				return updatedMenu
			})

			onOpenChange?.(false)

			return { previousMenu }
		},
		onError: (err, newItem, context) => {
			queryClient.setQueryData(['menu'], context?.previousMenu)
		},
		onSuccess: (data) => {},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['menu'] })
		},
	})

	return { addMutation }
}

export function deleteItemMutation(
	queryClient: QueryClient,
	onOpenChange?: (open: boolean) => void
) {
	const deleteMutation = useMutation({
		mutationFn: deleteMenuItem,
		onMutate: async (id: string) => {
			await queryClient.cancelQueries({ queryKey: ['menu'] })
			const previousMenu = queryClient.getQueryData(['menu'])
			queryClient.setQueryData(['menu'], (old: ItemProps[] | undefined) => {
				const updatedMenu = (old || []).filter((item) => item.id !== id)
				return updatedMenu
			})
			onOpenChange?.(false)
			return { previousMenu }
		},
		onError: (err, id, context) => {
			console.error('Delete mutation error:', err)
			queryClient.setQueryData(['menu'], context?.previousMenu)
		},
		onSuccess: (data) => {},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['menu'] })
		},
	})

	return { deleteMutation }
}
