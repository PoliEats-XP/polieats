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
import { addItemFormSchema } from '@/lib/schemas/menu.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import { ItemNameInput } from './item-name-input'
import { ItemQuantityInput } from './quantity-item-input'
import { ItemPriceInput } from './item-price-input'

export function AddItemForm() {
	const form = useForm<z.infer<typeof addItemFormSchema>>({
		resolver: zodResolver(addItemFormSchema),
		defaultValues: {
			name: '',
			initial_available_quantity: 0,
			price: 0,
		},
	})

	async function onSubmit(values: z.infer<typeof addItemFormSchema>) {}

	return (
		<FormComponent {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								Nome do item
							</FormLabel>
							<FormControl>
								<ItemNameInput {...field} placeholder="Chiclete de menta" />
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
								<ItemQuantityInput
									{...field}
									value={undefined}
									placeholder="17"
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
								<ItemPriceInput {...field} value={undefined} placeholder="5" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center justify-between">
					<Button
						type="submit"
						// disabled={disabled || loading}
						className="rounded-sm w-40 text-white bg-gradient-to-r text-base from-[#ED2152] from-0% to-[#C71585] to-80% font-normal py-5 cursor-pointer hover:opacity-80 transition-opacity duration-200 ease-in-out"
					>
						Adicionar item
					</Button>
					<Button
						variant="outline"
						className="rounded-sm w-24 cursor-pointer text-base"
					>
						Fechar
					</Button>
				</div>
			</form>
		</FormComponent>
	)
}
