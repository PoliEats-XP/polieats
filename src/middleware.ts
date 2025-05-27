import { betterFetch } from '@better-fetch/fetch'
import type { Session } from '@/lib/auth'
import { type NextRequest, NextResponse } from 'next/server'

const authRoutes = ['/login', '/register', '/forgot-password']
const authenticatedRoutes = ['/']
const adminRoutes = ['/dashboard']

export default async function authMiddleware(req: NextRequest) {
	const pathName = req.nextUrl.pathname
	const isAuthRoute = authRoutes.includes(pathName)
	const isAuthenticatedRoute = authenticatedRoutes.includes(pathName)
	const isAdminRoute = adminRoutes.includes(pathName)

	const { data: session } = await betterFetch<Session>(
		'/api/auth/get-session',
		{
			baseURL: process.env.BETTER_AUTH_URL,
			headers: {
				cookie: req.headers.get('cookie') || '',
			},
		}
	)

	// Master role has unrestricted access to all pages
	if (session && session.user.role === 'master') {
		return NextResponse.next()
	}

	// No session - redirect to login unless already on auth route
	if (!session) {
		if (isAuthRoute) {
			return NextResponse.next()
		}
		return NextResponse.redirect(new URL('/login', req.url))
	}

	const role = session.user.role

	console.log('role:', role)

	// Admin role logic
	if (role === 'admin') {
		// Admin trying to access user routes - redirect to dashboard
		if (isAuthenticatedRoute) {
			return NextResponse.redirect(new URL('/dashboard', req.url))
		}
		// Admin trying to access auth routes - redirect to dashboard
		if (isAuthRoute) {
			return NextResponse.redirect(new URL('/dashboard', req.url))
		}
		// Admin accessing admin routes - allow
		if (isAdminRoute) {
			return NextResponse.next()
		}
	}

	// Regular user logic
	if (role !== 'admin') {
		// User trying to access auth routes - redirect to home
		if (isAuthRoute) {
			return NextResponse.redirect(new URL('/', req.url))
		}
		// User trying to access admin routes - redirect to home
		if (isAdminRoute) {
			return NextResponse.redirect(new URL('/', req.url))
		}
		// User accessing user routes - allow
		if (isAuthenticatedRoute) {
			return NextResponse.next()
		}
	}

	// Default allow
	return NextResponse.next()
}

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.ico$|.*\\.webp$).*)',
	],
}
