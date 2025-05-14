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
import { Turnstile } from '@marsidev/react-turnstile'
import type { z } from 'zod'
import { forgetPasswordFormSchema } from '@/lib/schemas/auth.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { OrLine } from './or-line'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/hooks/useAuthState'
import { authClient, signIn } from '@/lib/auth-client'
import { useTheme } from 'next-themes'
import { IconInput } from '../icon-input'
import { AtSign, Chrome, KeyRound } from 'lucide-react'
import { GradientButton } from '../gradient-button'

export function Form() {
	const { theme } = useTheme()

	const router = useRouter()
	const { loading, setSuccess, setError, setLoading, resetState } =
		useAuthState()

	const form = useForm<z.infer<typeof forgetPasswordFormSchema>>({
		resolver: zodResolver(forgetPasswordFormSchema),
		defaultValues: {
			email: '',
			// password: '',
		},
	})

	async function onSubmit(values: z.infer<typeof forgetPasswordFormSchema>) {
		try {
			await authClient.forgetPassword(
				{
					email: values.email,
					redirectTo: '/reset-password',
				},
				{
					onResponse: () => {
						setLoading(false)
					},
					onRequest: () => {
						resetState()
						setLoading(true)
					},
					onSuccess: (ctx) => {
						setSuccess('LoggedIn successfully')
						setLoading(false)
						toast.success('E-mail de redefinição de senha enviado com sucesso!')
						router.push('/')
					},
					onError: (error) => {
						setError(error.error.message)
						setLoading(false)
						toast.error('Erro ao enviar e-mail de redefinição!')
					},
				}
			)
		} catch (error) {
			console.log(error)
			setError('Something get wrong')
			toast.error('Erro ao enviar e-mail de redefinição!')
			setLoading(false)
		}
	}

	return (
		<FormComponent {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-midgray text-lg rounded-[3px]">
								E-mail
							</FormLabel>
							<FormControl>
								<IconInput
									LeftIcon={AtSign}
									placeholder="email@email.com"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="captcha"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Turnstile
									{...field}
									siteKey="1x00000000000000000000AA" // Test site key (always pass)
									options={{
										action: 'submit-form',
										theme: theme === 'dark' ? 'dark' : 'light',
										language: 'pt',
										size: 'flexible',
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<GradientButton
					variant="filled"
					className="-mt-3"
					loading={loading}
					disabled={form.formState.isSubmitting}
				>
					Enviar e-mail
				</GradientButton>
				<div className="text-center -mt-7">
					<Link
						href="/login"
						className="text-xs text-midgray hover:text-midgray/80 underline"
					>
						Lembrou sua senha? <span className="underline">Entrar</span>
					</Link>
				</div>
			</form>
		</FormComponent>
	)
}
