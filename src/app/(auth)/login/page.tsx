import { AuthHero } from '@/components/auth/auth-hero'
import { Form } from '@/components/auth/login-form'
import CookieConsent from '@/components/ui/cookie-consent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'PoliEats - Login',
	description: 'Login page for PoliEats',
}

export default function Login() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 max-w-md mx-auto">
			<CookieConsent variant="small" />

			<div className="flex flex-col items-center justify-center flex-1 w-full py-8">
				<AuthHero />

				<p className="text-base text-muted-foreground font-light mb-6 text-center">
					Bem-vindo de volta, faça login para continuar
				</p>

				<Form />
			</div>
		</div>
	)
}
