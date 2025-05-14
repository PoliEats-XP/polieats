import { AuthHero } from '@/components/auth/auth-hero'
import { ForgetPasswordForm } from '@/components/auth/forget-password-form'

export default function ForgetPassword() {
	return (
		<div className="flex flex-col items-center justify-center h-screen p-4 md:p-0 max-w-md mx-auto">
			<AuthHero />

			<p className="text-lg text-midgray font-light mb-6 text-center">
				Esqueceu sua senha? Não se preocupe!
			</p>

			<ForgetPasswordForm />
		</div>
	)
}
