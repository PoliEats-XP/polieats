import { z } from 'zod'

export const itemFormSchema = z.object({
	id: z.string().optional(),
	name: z.any(),
	initial_available_quantity: z.any(),
	price: z.any(),
})
