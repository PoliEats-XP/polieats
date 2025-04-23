import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { openAPI } from 'better-auth/plugins'

// auth instance used on server side

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: { enabled: true },
  // socialProviders: {
  //   google: {
  //     clientId: '',
  //     clientSecret: ''
  //   }
  // }
  plugins: [openAPI()]
})