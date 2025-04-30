import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

// auth instance used on client side

export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL!,
	plugins: [adminClient()],
})

export const { signIn, signOut, signUp, useSession } = authClient
