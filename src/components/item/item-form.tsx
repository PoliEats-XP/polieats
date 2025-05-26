'use client'

import { useForm } from 'react-hook-form'
import {
	Form as FormComponent,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form'
import type { z } from 'zod'
import { itemFormSchema } from '@/lib/schemas/menu.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import { IconInput } from '../icon-input'
import { DollarSign, Hash, Pencil } from 'lucide-react'
import { GradientButton } from '../gradient-button'
import { useEffect, useState } from 'react'
import { useStore } from '@/utils/store'
import { deleteItemMutation } from '@/utils/mutations'
import { useQueryClient } from '@tanstack/react-query'

interface ItemFormProps {
	id?: string
	onSubmit: (values: z.infer<typeof itemFormSchema>) => void
	item_name?: string
	item_price?: number
	item_available_quantity?: number
	onOpenChange?: (open: boolean) => void
	isManaging?: boolean
	originalValues?: {
		name: string
		price: number
		initial_available_quantity: number
	}
}

export function ItemForm({
	id,
	onSubmit,
	item_available_quantity,
	item_name,
	item_price,
	onOpenChange,
	isManaging = false,
	originalValues,
}: ItemFormProps) {
	const queryClient = useQueryClient()
	const [hasChanges, setHasChanges] = useState(false)

	const isEditing = useStore((state) => state.isEditing)
	const setIsEditing = useStore((state) => state.setIsEditing)

	useEffect(() => {
		setIsEditing(!!item_name && !isManaging)
	}, [item_name, isManaging])

	const form = useForm<z.infer<typeof itemFormSchema>>({
		resolver: zodResolver(itemFormSchema),
		defaultValues: {
			id: id || undefined,
			name: item_name || '',
			initial_available_quantity: item_available_quantity || 0,
			price: item_price || 0,
		},
	})

	// Watch for changes when in managing mode
	useEffect(() => {
		if (isManaging && originalValues) {
			const subscription = form.watch((values) => {
				const changed =
					values.name !== originalValues.name ||
					Number(values.price) !== originalValues.price ||
					Number(values.initial_available_quantity) !==
						originalValues.initial_available_quantity

				setHasChanges(changed)
			})

			return () => subscription.unsubscribe()
		}
	}, [form, isManaging, originalValues])

	const { deleteMutation } = deleteItemMutation(queryClient, onOpenChange)

	async function onSubmitDelete(values: z.infer<typeof itemFormSchema>) {
		if (!values.id) {
			return
		}

		return deleteMutation.mutate(values.id)
	}

	// Determine button text and action based on mode
	const getButtonConfig = () => {
		if (isManaging) {
			return {
				text: hasChanges ? 'Salvar alterações' : 'Fechar',
				action: hasChanges
					? form.handleSubmit(onSubmit)
					: () => onOpenChange?.(false),
			}
		}

		return {
			text: isEditing ? 'Excluir item' : 'Adicionar item',
			action: isEditing
				? () => onSubmitDelete(form.getValues())
				: form.handleSubmit(onSubmit),
		}
	}

	const buttonConfig = getButtonConfig()

	return (
		<FormComponent {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-midgray text-lg rounded-[3px]">
								Nome do item
							</FormLabel>
							<FormControl>
								<IconInput
									LeftIcon={Pencil}
									leftIconSize={5}
									placeholder="Chiclete de menta"
									inputValue={field.value}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="initial_available_quantity"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-midgray text-lg rounded-[3px]">
								Quantidade inicial do item
							</FormLabel>
							<FormControl>
								<IconInput
									LeftIcon={Hash}
									placeholder="17"
									{...field}
									inputValue={field.value}
									onChange={(e) => field.onChange(Number(e))}
									leftIconSize={5}
									inputType="number"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="price"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-midgray text-lg rounded-[3px]">
								Preço do item
							</FormLabel>
							<FormControl>
								<IconInput
									LeftIcon={DollarSign}
									placeholder="5"
									{...field}
									inputValue={field.value}
									onChange={(e) => field.onChange(Number(e))}
									leftIconSize={5}
									inputType="number"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center justify-between">
					{isManaging && !hasChanges ? (
						<Button
							variant="outline"
							className="rounded-sm w-40 text-base"
							onClick={buttonConfig.action}
							type="button"
						>
							{buttonConfig.text}
						</Button>
					) : (
						<GradientButton
							variant="filled"
							className="rounded-sm w-40 text-base"
							onClick={buttonConfig.action}
						>
							{buttonConfig.text}
						</GradientButton>
					)}
					{!isManaging && (
						<Button
							variant="outline"
							className="rounded-sm w-24 cursor-pointer text-base"
							onClick={() => onOpenChange?.(false)}
							type="button"
						>
							Fechar
						</Button>
					)}
				</div>
			</form>
		</FormComponent>
	)
}
