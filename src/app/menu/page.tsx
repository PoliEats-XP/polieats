import type { Metadata } from 'next'
import { MenuClient } from '../../components/menu-client'

export const metadata: Metadata = {
	title: 'PoliEats - Menu',
	description: 'Browse our delicious menu items',
}

export default function MenuPage() {
	return <MenuClient />
}
