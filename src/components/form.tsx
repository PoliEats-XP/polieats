'use client'

import { useForm } from 'react-hook-form'
import {
	Form as FormComponent,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import type { z } from 'zod'
import { formSchema } from '@/lib/schemas/login.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EmailInput } from './email-input'
import { PasswordInput } from './password-input'
import { LoginButton } from './login-button'

export function Form() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	function onSubmit(values: z.infer<typeof formSchema>) {}

	return (
		<FormComponent {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								E-mail
							</FormLabel>
							<FormControl>
								<EmailInput {...field} placeholder="email@email.com" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								Senha
							</FormLabel>
							<FormControl>
								{/* <EmailInput {...field} placeholder="email@email.com" /> */}
								<PasswordInput {...field} placeholder="********" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<LoginButton />
			</form>
		</FormComponent>
	)
}
