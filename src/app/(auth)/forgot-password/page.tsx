import { AuthHero } from '@/components/auth/auth-hero'
import { ForgetPasswordForm } from '@/components/auth/forget-password-form'

export default function ForgetPassword() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 max-w-md mx-auto">
			<div className="flex flex-col items-center justify-center flex-1 w-full py-8">
				<AuthHero />

				<p className="text-base text-muted-foreground font-light mb-6 text-center">
					Esqueceu sua senha? Não se preocupe!
				</p>

				<ForgetPasswordForm />
			</div>
		</div>
	)
}
