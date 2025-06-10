import { betterFetch } from '@better-fetch/fetch'
import type { Session } from '@/lib/auth'
import { headers } from 'next/headers'
import { Navbar } from './navbar'

export async function MenuNavbar() {
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
		let variant: 'default' | 'admin' | 'master' = 'default'
		const activeLink = 'user-menu' as const // All users on menu page see menu as active

		if (session?.user?.role === 'master') {
			variant = 'master'
		} else if (session?.user?.role === 'admin') {
			variant = 'default' // Admin users see simple menu indicator
		} else {
			variant = 'default' // Regular users see simple menu indicator
		}

		return <Navbar variant={variant} activeLink={activeLink} />
	} catch (error) {
		console.error('Error fetching session for menu navbar:', error)
		// Fallback to default variant if session fetch fails
		return <Navbar variant="default" activeLink={null} />
	}
}
