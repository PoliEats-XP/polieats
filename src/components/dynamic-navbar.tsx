'use client'

import { Navbar } from './navbar'
import { authClient } from '@/lib/auth-client'

export function DynamicNavbar() {
	const { data } = authClient.useSession()
	const session = data

	// Determine navbar variant based on user role
	const navbarVariant = session?.user.role === 'master' ? 'master' : 'default'

	// Don't set any active link for non-dashboard pages
	return <Navbar variant={navbarVariant} activeLink={null} />
}
