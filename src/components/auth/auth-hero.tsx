import Image from 'next/image'

export function AuthHero() {
	return (
		<>
			<Image
				src="/main_logo.svg"
				alt="PoliEats main logo"
				height={80}
				width={80}
			/>
			<h1 className="text-2xl bg-gradient-to-r from-gradient-from from-0% to-gradient-to to-80% text-transparent bg-clip-text mt-4">
				polieats
			</h1>
		</>
	)
}
