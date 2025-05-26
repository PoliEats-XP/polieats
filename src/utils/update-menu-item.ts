import type { itemFormSchema } from '@/lib/schemas/menu.schemas'
import { betterFetch } from '@better-fetch/fetch'
import type { z } from 'zod'

type MenuItem = z.infer<typeof itemFormSchema>

export async function updateMenuItem(item: MenuItem) {
	const { data: response } = await betterFetch('/api/menu/items', {
		method: 'PUT',
		body: JSON.stringify(item),
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response) {
		throw new Error('Failed to update menu item')
	}

	return response
}
