import { AuthHero } from '@/components/auth/auth-hero'
import { RegisterForm } from '@/components/auth/register-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'PoliEats - Register',
	description: 'Register page for PoliEats',
}

export default function Register() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 max-w-md mx-auto">
			<div className="flex flex-col items-center justify-center flex-1 w-full py-8">
				<AuthHero />

				<p className="text-base text-muted-foreground font-light mb-6 text-center">
					Bem-vindo! Preencha o formulário para criar sua conta
				</p>

				<RegisterForm />
			</div>
		</div>
	)
}
