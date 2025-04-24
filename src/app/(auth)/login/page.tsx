import { Form } from '@/components/form'
import Image from 'next/image'

export default function Login() {
	return (
		<div className="flex flex-col items-center justify-center h-screen p-4 md:p-0 max-w-md mx-auto">
			<Image
				src="/main_logo.svg"
				alt="PoliEats main logo"
				height={80}
				width={80}
			/>
			<h1 className="text-2xl bg-gradient-to-r from-[#EB4834] from-0% to-[#F89C44] to-80% text-transparent bg-clip-text mt-4">
				polieats
			</h1>

			<p className="text-lg text-[#7D7D7D] font-light mb-6">
				Bem-vindo de volta, faça login para continuar
			</p>

			<Form />
		</div>
	)
}
