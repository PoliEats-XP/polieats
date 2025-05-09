'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

interface EmailVerificationBannerProps {
	onResendEmail?: () => void
}

export function EmailVerificationBanner({
	onResendEmail,
}: EmailVerificationBannerProps) {
	const { data } = authClient.useSession()
	const session = data

	if (session?.user.emailVerified) {
		return null
	}

	async function sendVerificationEmail() {
		await authClient.sendVerificationEmail({
			email: session?.user.email!,
			callbackURL: '/',
		})
	}

	return (
		<div
			role="alert"
			className="bg-yellow-100 text-yellow-800 p-4 flex items-center justify-between"
		>
			<div className="flex items-center">
				<AlertTriangle className="h-5 w-5 mr-2" />
				<p className="font-medium">Seu e-mail ainda não está verificado.</p>
			</div>
			<Button
				variant="outline"
				onClick={sendVerificationEmail}
				className="cursor-pointer"
			>
				Enviar e-mail de verificação
			</Button>
		</div>
	)
}
