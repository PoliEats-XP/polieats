import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { admin, openAPI, captcha } from 'better-auth/plugins'
import { Resend } from 'resend'
import { EmailTemplate } from '@daveyplate/better-auth-ui/server'

// auth instance used on server side

const resend = new Resend(process.env.RESEND_API_KEY!)

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: { enabled: true },
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }, request) => {
			const name = user.name || user.email?.split('@')[0] || 'Usuário'

			try {
				await resend.emails.send({
					from: 'dev.guilhermebrasil@gmail.com',
					to: user.email!,
					subject: 'Verifique seu e-mail',
					react: EmailTemplate({
						action: 'Verificar e-mail',
						content: `Olá ${name}, clique no botão abaixo para verificar seu e-mail.`,
						heading: 'Verifique seu e-mail',
						siteName: 'PoliEats',
						baseUrl: process.env.NEXTAUTH_URL,
						url,
					}),
				})
			} catch (e) {
				console.error('Error sending email verification', e)
			}
		},
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
	},
	socialProviders: {
		google: {
			prompt: 'select_account',
			clientId: process.env.GOOGLE_CLIENT_ID! as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET! as string,
		},
	},
	plugins: [
		openAPI(),
		admin(),
		// DISABLED FOR NOW
		// captcha({
		// 	provider: 'cloudflare-turnstile',
		// 	secretKey: process.env.TURNSTILE_SECRET_KEY!,
		// }),
	],
})

export type Session = typeof auth.$Infer.Session
