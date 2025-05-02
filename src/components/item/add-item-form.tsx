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

interface ItemFormProps {
	onSubmitInclude: (values: z.infer<typeof itemFormSchema>) => void
	onSubmitDelete: (values: z.infer<typeof itemFormSchema>) => void
	item_name?: string
	item_price?: number
	item_available_quantity?: number
	onOpenChange?: (open: boolean) => void
}

export function ItemForm({
	onSubmitInclude,
	onSubmitDelete,
	item_available_quantity,
	item_name,
	item_price,
	onOpenChange,
}: ItemFormProps) {
	const isEditing = !!item_name

	const form = useForm<z.infer<typeof itemFormSchema>>({
		resolver: zodResolver(itemFormSchema),
		defaultValues: {
			id: undefined,
			name: item_name || '',
			initial_available_quantity: item_available_quantity || 0,
			price: item_price || 0,
		},
	})

	return (
		<FormComponent {...form}>
			<form
				onSubmit={form.handleSubmit(
					isEditing ? onSubmitDelete : onSubmitInclude
				)}
				className="space-y-8"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								Nome do item
							</FormLabel>
							<FormControl>
								<IconInput
									LeftIcon={Pencil}
									leftIconSize={5}
									placeholder="Chiclete de menta"
									inputValue={field.value}
									// inputValue={item_name || field.value}
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
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								Quantidade inicial do item
							</FormLabel>
							<FormControl>
								<IconInput
									LeftIcon={Hash}
									placeholder="17"
									{...field}
									inputValue={
										// Number(item_available_quantity) || Number(field.value)
										field.value
									}
									onChange={(e) => field.onChange(Number(e.target.value))}
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
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								Preço do item
							</FormLabel>
							<FormControl>
								<IconInput
									LeftIcon={DollarSign}
									placeholder="5"
									{...field}
									inputValue={
										// Number(item_price) ||
										// Number.parseInt(field.value.toString())
										field.value
									}
									onChange={(e) => field.onChange(Number(e.target.value))}
									leftIconSize={5}
									inputType="number"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center justify-between">
					<GradientButton
						variant="filled"
						className="rounded-sm w-40 text-base"
					>
						{isEditing ? 'Excluir item' : 'Adicionar item'}
					</GradientButton>
					<Button
						variant="outline"
						className="rounded-sm w-24 cursor-pointer text-base"
						onClick={() => onOpenChange?.(false)}
						type="button"
					>
						Fechar
					</Button>
				</div>
			</form>
		</FormComponent>
	)
}
