import { createAuthClient } from 'better-auth/react'

// auth instance used on client side

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!
})