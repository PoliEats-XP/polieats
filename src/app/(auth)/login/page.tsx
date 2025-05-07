'use client'

import { AuthHero } from '@/components/auth/auth-hero'
import { Form } from '@/components/auth/login-form'
import CookieConsent from '@/components/ui/cookie-consent'

export default function Login() {
	return (
		<div className="flex flex-col items-center justify-center h-screen p-4 md:p-0 max-w-md mx-auto">
			<CookieConsent variant="small" />

			<AuthHero />

			<p className="text-lg text-midgray font-light mb-6">
				Bem-vindo de volta, faça login para continuar
			</p>

			<Form />
		</div>
	)
}
