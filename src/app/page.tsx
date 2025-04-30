'use client'

import { Navbar } from '@/components/navbar'
import { ProfileDialog } from '@/components/profile-dialog'
import { authClient } from '@/lib/auth-client'
import { useEffect } from 'react'

export default function Home() {
	// useEffect(() => {
	const session = authClient.useSession()

	console.log(session.data?.user.role)
	// })

	return (
		<>
			<Navbar />

			<h1>Hello World</h1>

			<ProfileDialog />
		</>
	)
}
