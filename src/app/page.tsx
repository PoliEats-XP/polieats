import { Navbar } from '@/components/navbar'
import { ProfileDialog } from '@/components/profile-dialog'

export const metadata = {
	title: 'PoliEats - Home',
	description: 'Home page for PoliEats',
}

export default function Home() {
	return (
		<>
			<Navbar />

			<h1>Hello World</h1>

			<ProfileDialog />
		</>
	)
}
