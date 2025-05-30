import type { Metadata } from 'next'
import { MenuClient } from '../../components/menu-client'
import { Suspense } from 'react'

// Force dynamic rendering since this page uses search params
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	title: 'PoliEats - Menu',
	description: 'Browse our delicious menu items',
}

function MenuFallback() {
	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Carregando menu...</p>
				</div>
			</div>
		</div>
	)
}

export default function MenuPage() {
	return (
		<Suspense fallback={<MenuFallback />}>
			<MenuClient />
		</Suspense>
	)
}
