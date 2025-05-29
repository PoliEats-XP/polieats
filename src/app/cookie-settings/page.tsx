import { CookieSettingsPage } from '@/components/cookie-settings-page'
import { DynamicNavbar } from '@/components/dynamic-navbar'
import { EmailVerificationBanner } from '@/components/email-verification-banner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'PoliEats - Configurações de Cookies',
	description: 'Gerencie suas preferências de cookies e privacidade',
}

export default function CookieSettingsRoute() {
	return (
		<>
			<EmailVerificationBanner />
			<DynamicNavbar />

			<div className="min-h-screen bg-background py-8">
				<div className="container mx-auto px-4">
					<CookieSettingsPage />
				</div>
			</div>
		</>
	)
}
