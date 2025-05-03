import { betterFetch } from '@better-fetch/fetch'

export async function deleteMenuItem(id: string) {
	try {
		const { error } = await betterFetch<null>('/api/menu/items', {
			body: JSON.stringify({ id }),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'DELETE',
		})
		if (error) {
			throw new Error(error.message || 'Failed to delete item')
		}
		return { id }
	} catch (e) {
		console.error('Error deleting menu item:', e)
		throw new Error('Failed to delete menu item')
	}
}
