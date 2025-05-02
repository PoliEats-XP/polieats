import { betterFetch } from '@better-fetch/fetch'

export async function deleteMenuItem(id: string) {
	const { error } = await betterFetch<null>(`/api/menu/${id}`, {
		headers: { cookie: document.cookie },
		method: 'DELETE',
	})
	if (error) {
		throw new Error(error.message || 'Failed to delete item')
	}
	return { id } // Return the deleted item's ID for reference
}
