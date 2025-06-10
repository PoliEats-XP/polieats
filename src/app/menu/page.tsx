import type { Metadata } from 'next'
import { Suspense } from 'react'
import { MenuClient } from '../../components/menu-client'
import { MenuNavbar } from '../../components/menu-navbar'

// Force dynamic rendering since this page uses search params
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	title: 'PoliEats - Menu',
	description: 'Browse our delicious menu items',
}

function MenuLoading() {
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
			<div className="mb-8">
				<div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2 w-48" />
				<div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-96" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{[...Array(8)].map((_, idx) => (
					<div
						key={idx}
						className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
					/>
				))}
			</div>
		</div>
	)
}

export default function MenuPage() {
	return (
		<>
			<MenuNavbar />
			<Suspense fallback={<MenuLoading />}>
				<MenuClient />
			</Suspense>
		</>
	)
}
