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
import { IconInput } from '../icon-input'
import { DollarSign, Hash, Pencil } from 'lucide-react'
import { GradientButton } from '../gradient-button'

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
								<IconInput
									LeftIcon={Pencil}
									leftIconSize={5}
									placeholder="Chiclete de menta"
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
									inputValue={undefined}
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
									inputValue={undefined}
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
						Adicionar item
					</GradientButton>
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
