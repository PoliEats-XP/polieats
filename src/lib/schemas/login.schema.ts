import { z } from 'zod'

export const formSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
})
