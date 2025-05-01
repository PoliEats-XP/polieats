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
import { loginFormSchema } from '@/lib/schemas/auth.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { OrLine } from './or-line'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/hooks/useAuthState'
import { signIn } from '@/lib/auth-client'
import { useTheme } from 'next-themes'
import { IconInput } from '../icon-input'
import { AtSign, Chrome, KeyRound } from 'lucide-react'
import { GradientButton } from '../gradient-button'

export function Form() {
	const { theme } = useTheme()

	const router = useRouter()
	const {
		error,
		success,
		loading,
		setSuccess,
		setError,
		setLoading,
		resetState,
	} = useAuthState()

	const form = useForm<z.infer<typeof loginFormSchema>>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	async function onSubmit(values: z.infer<typeof loginFormSchema>) {
		try {
			await signIn.email(
				{
					email: values.email,
					password: values.password,
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
						toast.success('Login realizado com sucesso!')
						router.push('/')
					},
					onError: (error) => {
						setError(error.error.message)
						setLoading(false)
						toast.error('Erro ao realizar login!')
					},
				}
			)
		} catch (error) {
			console.log(error)
			setError('Something get wrong')
			toast.error('Erro ao realizar login!')
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
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
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
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								Senha
							</FormLabel>
							<FormControl>
								<div className="contents">
									<IconInput
										LeftIcon={KeyRound}
										placeholder="********"
										inputType="password"
										{...field}
									/>
									<div className="text-right">
										<Link
											href="/forgot-password"
											className="text-xs text-[#7d7d7d] hover:text-[#7d7d7d/80] underline"
										>
											Esqueci minha senha
										</Link>
									</div>
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
					Entrar
				</GradientButton>
				<OrLine />
				<GradientButton variant="google" className="flex items-center gap-2" />
				<div className="text-center -mt-7">
					<Link
						href="/register"
						className="text-xs text-[#7d7d7d] hover:text-[#7d7d7d/80] underline"
					>
						Não tem uma conta?{' '}
						<span className="underline">Cadastre-se aqui</span>
					</Link>
				</div>
			</form>
		</FormComponent>
	)
}
