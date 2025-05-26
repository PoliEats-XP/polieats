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
import Link from 'next/link'
import { OrLine } from './or-line'
import { toast } from 'sonner'
import { signIn, signUp } from '@/lib/auth-client'
import { useAuthState } from '@/hooks/useAuthState'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { IconInput } from '../icon-input'
import { AtSign, KeyRound, User } from 'lucide-react'
import { GradientButton } from '../gradient-button'

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

	async function handleGoogleSignIn() {
		await signIn.social({
			provider: 'google',
		})
	}

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
							<FormLabel
								className="font-light text-midgray text-lg rounded-[3px]"
								htmlFor="name"
							>
								Nome
							</FormLabel>
							<FormControl>
								<IconInput
									id="name"
									LeftIcon={User}
									placeholder="John Doe"
									{...field}
								/>
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
							<FormLabel
								className="font-light text-midgray text-lg rounded-[3px]"
								htmlFor="email"
							>
								E-mail
							</FormLabel>
							<FormControl>
								<IconInput
									id="email"
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
							<FormLabel
								className="font-light text-midgray text-lg rounded-[3px]"
								htmlFor="password"
							>
								Senha
							</FormLabel>
							<FormControl>
								<div className="contents">
									<IconInput
										id="password"
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
							<FormLabel
								className="font-light text-midgray text-lg rounded-[3px]"
								htmlFor="confirmPassword"
							>
								Confirmar senha
							</FormLabel>
							<FormControl>
								<div className="contents">
									<IconInput
										id="confirmPassword"
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
									siteKey="1x00000000000000000000AA"
									options={{
										theme: theme === 'dark' ? 'dark' : 'light',
									}}
									onSuccess={(token) => {
										field.onChange(token)
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
				<GradientButton
					variant="google"
					className="flex items-center gap-2"
					onClick={() => handleGoogleSignIn()}
				/>
				<div className="text-center -mt-7">
					<Link
						href="/login"
						className="text-xs text-midgray hover:text-midgray/80 underline"
					>
						Já tem uma conta? <span className="underline">Faça login aqui</span>
					</Link>
				</div>
			</form>
		</FormComponent>
	)
}
