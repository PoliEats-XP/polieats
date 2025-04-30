'use client'

import { registerFormSchema } from '@/lib/schemas/auth.schemas'
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
} from '../ui/form'
import { EmailInput } from './email-input'
import { PasswordInput } from './password-input'
import Link from 'next/link'
import { AuthenticateButton } from './login-button'
import { OrLine } from './or-line'
import { GoogleLoginButton } from './google-login-button'
import { NameInput } from './name-input'
import { toast } from 'sonner'
import { signUp } from '@/lib/auth-client'
import { useAuthState } from '@/hooks/useAuthState'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

export function RegisterForm() {
	const { theme } = useTheme()

	const { loading, setLoading, resetState, setError, setSuccess } =
		useAuthState()
	const router = useRouter()

	const form = useForm<z.infer<typeof registerFormSchema>>({
		resolver: zodResolver(registerFormSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	})

	async function onSubmit(values: z.infer<typeof registerFormSchema>) {
		try {
			if (values.password !== values.confirmPassword) {
				form.setError('confirmPassword', {
					type: 'manual',
					message: 'As senhas não coincidem',
				})

				return toast.error('As senhas não coincidem')
			}

			await signUp.email(
				{
					name: values.name,
					email: values.email,
					password: values.password,
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
							'Conta criada com sucesso! Redirecionando para o login...'
						)
						form.reset()

						setTimeout(() => {
							router.push('/login')
						}, 3000)
					},
					onError: (error) => {
						toast.error('Erro ao realizar cadastro!')
						setError(error.error.message)
						setLoading(false)
					},
				}
			)
		} catch (error) {
			console.log(error)
			setError('Something get wrong')
			toast.error('Erro ao realizar cadastro!')
			setLoading(false)
		}
	}

	return (
		<FormComponent {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								Nome
							</FormLabel>
							<FormControl>
								<NameInput {...field} placeholder="John Doe" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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
								<div className="contents">
									<PasswordInput {...field} placeholder="********" />
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
							<FormLabel className="font-light text-[#7d7d7d] text-lg rounded-[3px]">
								Confirmar senha
							</FormLabel>
							<FormControl>
								<div className="contents">
									<PasswordInput {...field} placeholder="********" />
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
				<AuthenticateButton
					loading={loading}
					disabled={form.formState.isSubmitting}
				>
					Criar conta
				</AuthenticateButton>
				<OrLine />
				<GoogleLoginButton />
				<div className="text-center -mt-7">
					<Link
						href="/login"
						className="text-xs text-[#7d7d7d] hover:text-[#7d7d7d/80] underline"
					>
						Já tem uma conta? <span className="underline">Faça login aqui</span>
					</Link>
				</div>
			</form>
		</FormComponent>
	)
}
