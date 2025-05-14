import { AuthHero } from '@/components/auth/auth-hero'
import { ResetPasswordForm } from '@/components/reset-password-form'
import { toast } from 'sonner'

export default function ResetPassword() {
	const token = new URLSearchParams(window.location.search).get('token')

	if (!token) {
		toast.error('Token não encontrado na URL')
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen p-4 md:p-0 max-w-md mx-auto">
			<AuthHero />

			<p className="text-lg text-midgray font-light mb-6 text-center">
				Redefina sua senha para acessar sua conta
			</p>

			<ResetPasswordForm />
		</div>
	)
}
