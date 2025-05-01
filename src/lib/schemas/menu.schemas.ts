import { z } from 'zod'

export const addItemFormSchema = z.object({
	name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
	initial_available_quantity: z.number().min(1, {
		message: 'Quantidade inicial deve ser maior que 0',
	}),
	price: z.number().min(0.01, {
		message: 'Preço deve ser maior que 0',
	}),
})
