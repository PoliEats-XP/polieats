import { AuthHero } from '@/components/auth/auth-hero'
import { RegisterForm } from '@/components/auth/register-form'

export default function Register() {
	return (
		<div className="flex flex-col items-center justify-center h-screen p-4 md:p-0 max-w-md mx-auto">
			<AuthHero />

			<p className="text-lg text-[#7D7D7D] font-light mb-6 text-center">
				Bem-vindo! Preencha o formulário para criar sua conta
			</p>

			<RegisterForm />
		</div>
	)
}
