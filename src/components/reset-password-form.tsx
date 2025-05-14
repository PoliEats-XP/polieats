'use client'

import { resetPasswordFormSchema } from '@/lib/schemas/auth.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Turnstile } from '@marsidev/react-turnstile'
import type { z } from 'zod'
import {
	Form as FormComponent,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form'
import { toast } from 'sonner'
import { authClient, signUp } from '@/lib/auth-client'
import { useAuthState } from '@/hooks/useAuthState'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { IconInput } from './icon-input'
import { AtSign, KeyRound, User } from 'lucide-react'
import { GradientButton } from './gradient-button'

export function ResetPasswordForm({ token }: { token: string | null }) {
	const { theme } = useTheme()

	const { loading, setLoading, resetState, setError, setSuccess } =
		useAuthState()
	const router = useRouter()

	const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
		resolver: zodResolver(resetPasswordFormSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	})

	async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
		try {
			if (values.password !== values.confirmPassword) {
				form.setError('confirmPassword', {
					type: 'manual',
					message: 'As senhas não coincidem',
				})

				return toast.error('As senhas não coincidem')
			}

			await authClient.resetPassword(
				{
					newPassword: values.confirmPassword,
					token: token as string,
				},
				{
					onRequest: () => {
						resetState()
						setLoading(true)
					},
					onResponse: () => {
						setLoading(false)
					},
					onSuccess: () => {
						setSuccess('SignUp successful')
						setLoading(false)
						toast.success(
							'Senha resetada com sucesso! Redirecionando para o login...'
						)
						form.reset()

						setTimeout(() => {
							router.push('/login')
						}, 3000)
					},
					onError: (error) => {
						toast.error('Erro ao resetar sua senha cadastro!')
						console.log(error)
						setError(error.error.message)
						setLoading(false)
					},
				}
			)
		} catch (error) {
			console.log(error)
			setError('Something get wrong')
			toast.error('Erro ao resetar sua senha!')
			setLoading(false)
		}
	}

	return (
		<FormComponent {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-midgray text-lg rounded-[3px]">
								Nova senha
							</FormLabel>
							<FormControl>
								<div className="contents">
									<IconInput
										LeftIcon={KeyRound}
										placeholder="********"
										inputType="password"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-midgray text-lg rounded-[3px]">
								Confirmar senha
							</FormLabel>
							<FormControl>
								<div className="contents">
									<IconInput
										LeftIcon={KeyRound}
										placeholder="********"
										inputType="password"
										{...field}
									/>
								</div>
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
					Redefinir senha
				</GradientButton>
			</form>
		</FormComponent>
	)
}
