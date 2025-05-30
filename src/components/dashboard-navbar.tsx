import { betterFetch } from '@better-fetch/fetch'
import type { Session } from '@/lib/auth'
import { headers } from 'next/headers'
import { Navbar } from './navbar'

interface DashboardNavbarProps {
	activeLink?: 'orders' | 'menu'
}

export async function DashboardNavbar({
	activeLink = 'orders',
}: DashboardNavbarProps) {
	try {
		const headersList = await headers()
		const { data: session } = await betterFetch<Session>(
			'/api/auth/get-session',
			{
				baseURL: process.env.BETTER_AUTH_URL,
				headers: {
					cookie: headersList.get('cookie') || '',
				},
			}
		)

		// Determine the appropriate navbar variant based on user role
		const variant = session?.user?.role === 'master' ? 'master' : 'admin'

		return <Navbar variant={variant} activeLink={activeLink} />
	} catch (error) {
		console.error('Error fetching session for navbar:', error)
		// Fallback to admin variant if session fetch fails
		return <Navbar variant="admin" activeLink={activeLink} />
	}
}
