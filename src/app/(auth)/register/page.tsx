import { AuthHero } from '@/components/auth/auth-hero'
import { RegisterForm } from '@/components/auth/register-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'PoliEats - Register',
	description: 'Register page for PoliEats',
}

export default function Register() {
	return (
		<div className="flex flex-col items-center justify-center h-screen p-4 md:p-0 max-w-md mx-auto">
			<AuthHero />

			<p className="text-lg text-midgray font-light mb-6 text-center">
				Bem-vindo! Preencha o formulário para criar sua conta
			</p>

			<RegisterForm />
		</div>
	)
}
