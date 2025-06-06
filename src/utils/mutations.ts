import { type QueryClient, useMutation } from '@tanstack/react-query'
import { addMenuItem } from './add-menu-item'
import { updateMenuItem } from './update-menu-item'
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

export function updateItemMutation(
	queryClient: QueryClient,
	onOpenChange?: (open: boolean) => void
) {
	const updateMutation = useMutation({
		mutationFn: updateMenuItem,
		onMutate: async (updatedItem: MenuItem) => {
			await queryClient.cancelQueries({ queryKey: ['menu'] })

			const previousMenu = queryClient.getQueryData(['menu'])

			queryClient.setQueryData(['menu'], (old: ItemProps[] | undefined) => {
				const updatedMenu = (old || []).map((item) =>
					item.id === updatedItem.id
						? {
								...item,
								name: updatedItem.name,
								price: Number(updatedItem.price),
								quantity: Number(updatedItem.initial_available_quantity),
							}
						: item
				)
				return updatedMenu
			})

			onOpenChange?.(false)

			return { previousMenu }
		},
		onError: (err, updatedItem, context) => {
			console.error('Update mutation error:', err)
			queryClient.setQueryData(['menu'], context?.previousMenu)
		},
		onSuccess: (data) => {},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['menu'] })
		},
	})

	return { updateMutation }
}

// New mutation for refreshing orders when an order is completed
export function useOrderCompletedMutation(queryClient: QueryClient) {
	const orderCompletedMutation = useMutation({
		mutationFn: async () => {
			// This is just a trigger function - the actual order completion happens in the chatbot API
			// We just need to invalidate the orders cache to refetch the latest data
			return Promise.resolve()
		},
		onSuccess: () => {
			// Invalidate and refetch orders
			queryClient.invalidateQueries({ queryKey: ['orders'] })
		},
	})

	return { orderCompletedMutation }
}
