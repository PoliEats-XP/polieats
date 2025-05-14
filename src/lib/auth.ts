import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { admin, openAPI, captcha } from 'better-auth/plugins'
import { sendMail } from '@/utils/send-mail'

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			const name = user.name || user.email?.split('@')[0] || 'Usuário'

			try {
				sendMail({
					to: user.email!,
					subject: 'Redefinição de senha',
					text: `Olá, ${name}! Você solicitou a redefinição de sua senha. Para continuar, clique no botão abaixo e siga as instruções.`,
					html: `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; color: #1F2937; background-color: #ffffff;">
    <div style="padding: 1.25rem;">
        <h1 style="font-size: 1.5rem; line-height: 2rem; font-weight: 700; color: #1F2937;">Olá, ${name}!</h1>
    </div>
    <div style="padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 1.25rem;">
        <p style="font-size: 1rem; line-height: 1.5rem; color: #4B5563;">
            Recebemos uma solicitação para redefinir a senha da sua conta no <strong>PoliEats</strong>. Para prosseguir, clique no botão abaixo para criar uma nova senha.
        </p>
        <p style="font-size: 1rem; line-height: 1.5rem; color: #4B5563;">
            Se você não solicitou a redefinição de senha, pode ignorar este e-mail ou entrar em contato com nosso suporte.
        </p>
    </div>
    <div style="padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 1.25rem; text-align: center;">
        <a href="${url}" style="display: inline-block; padding-top: 0.75rem; padding-bottom: 0.75rem; padding-left: 1.5rem; padding-right: 1.5rem; border-radius: 0.375rem; font-size: 1.125rem; line-height: 1.75rem; font-weight: 700; color: #ffffff; text-decoration: none; background: #ED2152;">
            Redefinir Senha
        </a>
    </div>
    <div style="padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 1.25rem;">
        <p style="font-size: 1rem; line-height: 1.5rem; color: #4B5563;">
            Ou copie e cole este link no seu navegador: <a href="${url}" style="color: #ED2152; text-decoration: underline;">${url}</a>
        </p>
    </div>
    <div style="padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 1.25rem;">
        <p style="font-size: 1rem; line-height: 1.5rem; color: #4B5563;">
            Atenciosamente,<br>
            Equipe PoliEats
        </p>
    </div>
</div>`,
				})
			} catch (e) {}
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }, request) => {
			const name = user.name || user.email?.split('@')[0] || 'Usuário'

			try {
				sendMail({
					to: user.email!,
					subject: 'Verifique seu e-mail',
					text: `Olá, ${name}! Bem-vindo ao PoliEats! Para começar a saborear as melhores ofertas, confirme seu e-mail clicando no botão abaixo e libere um mundo de delícias!`,
					html: `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; color: #1F2937; background-color: #ffffff;">
    <div style="padding: 1.25rem;">
        <h1 style="font-size: 1.5rem; line-height: 2rem; font-weight: 700; color: #1F2937;">Olá, ${name}!</h1>
    </div>
    <div style="padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 1.25rem;">
        <p style="font-size: 1rem; line-height: 1.5rem; color: #4B5563;">
            Bem-vindo ao <strong>PoliEats</strong>! Sua fome encontrou o lugar certo. Para começar a saborear as melhores ofertas, confirme seu e-mail clicando no botão abaixo e libere um mundo de delícias!
        </p>
    </div>
    <div style="padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 1.25rem; text-align: center;">
        <a href="${url}" style="display: inline-block; padding-top: 0.75rem; padding-bottom: 0.75rem; padding-left: 1.5rem; padding-right: 1.5rem; border-radius: 0.375rem; font-size: 1.125rem; line-height: 1.75rem; font-weight: 700; color: #ffffff; text-decoration: none; background: #ED2152;">
            Confirmar E-mail
        </a>
    </div>
    <div style="padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 1.25rem;">
        <h2 style="margin-bottom: 0.5rem; font-size: 1.25rem; line-height: 1.75rem; font-weight: 700; color: #1F2937;">
            Próximos Passos:
        </h2>
        <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 1rem; color: #4B5563;">
            <li style="margin-bottom: 0.5rem;">
                <span style="color: #D83B7C;">🍔</span> Confirme seu e-mail
            </li>
            <li style="margin-bottom: 0.5rem;">
                <span style="color: #D83B7C;">🥗</span> Complete seu perfil
            </li>
            <li>
                <span style="color: #D83B7C;">🍕</span> Faça seu primeiro pedido
            </li>
        </ul>
    </div>
</div>`,
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
