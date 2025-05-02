import { z } from 'zod'

export const itemFormSchema = z.object({
	id: z.string().optional(),
	name: z.string(), //.min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
	initial_available_quantity: z.any(),
	price: z.any(),
})
