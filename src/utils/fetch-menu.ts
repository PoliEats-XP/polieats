import { betterFetch } from '@better-fetch/fetch'

interface ItemProps {
	id: string
	name: string
	quantity: number
	price: number
}

export async function fetchMenu() {
	const { data } = await betterFetch<{ items: ItemProps[] }>(
		'/api/menu/items',
		{
			headers: { cookie: document.cookie },
			method: 'GET',
		}
	)

	return data?.items || []
}
