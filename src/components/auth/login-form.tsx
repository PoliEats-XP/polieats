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
	const { loading, setSuccess, setError, setLoading, resetState } =
		useAuthState()

	const form = useForm<z.infer<typeof loginFormSchema>>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	async function handleGoogleSignIn() {
		await signIn.social({
			provider: 'google',
		})
	}

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
			// console.log(error)
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
							<FormLabel
								className="font-light text-midgray text-lg rounded-[3px]"
								htmlFor="email"
							>
								E-mail
							</FormLabel>
							<FormControl>
								<IconInput
									id="email"
									// name='email'
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
										// aria-labelledby="password"
										LeftIcon={KeyRound}
										placeholder="********"
										inputType="password"
										{...field}
									/>
									<div className="text-right">
										<Link
											href="/forgot-password"
											className="text-xs text-midgray hover:text-midgray/80 underline"
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
						href="/register"
						className="text-xs text-midgray hover:text-midgray/80 underline"
					>
						Não tem uma conta?{' '}
						<span className="underline">Cadastre-se aqui</span>
					</Link>
				</div>
			</form>
		</FormComponent>
	)
}
