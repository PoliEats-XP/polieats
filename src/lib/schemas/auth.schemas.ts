import { z } from 'zod'

export const loginFormSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
	captcha: z.any(),
})

export const registerFormSchema = z.object({
	name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
	email: z.string().email({ message: 'E-mail é obrigatório' }),
	password: z
		.string()
		.min(6, { message: 'Senha deve ter pelo menos 6 caracteres.' })
		.max(20, { message: 'Senha deve ter no máximo 20 caracteres.' }),
	confirmPassword: z
		.string()
		.min(6, { message: 'Senha deve ter pelo menos 6 caracteres.' }),
	captcha: z.any({ message: 'Captcha é obrigatório' }),
})

export const forgetPasswordFormSchema = z.object({
	email: z.string().email('E-mail é obrigatório'),
	captcha: z.any(),
})

export const resetPasswordFormSchema = z.object({
	password: z
		.string()
		.min(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
		.max(20, { message: 'Senha deve ter no máximo 20 caracteres' }),
	confirmPassword: z
		.string()
		.min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
	captcha: z.any(),
})
