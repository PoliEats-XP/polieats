import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DashboardClient } from '../../../components/dashboard-client'
import { EmailVerificationBanner } from '@/components/email-verification-banner'

export const metadata: Metadata = {
	title: 'PoliEats - Dashboard - Menu',
	description: 'Dashboard page for PoliEats - Menu',
}

function DashboardLoading() {
	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-48" />
				<div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-32" />
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, idx) => (
					<div
						key={idx}
						className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
					/>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

export default function Dashboard() {
	return (
		<>
			<EmailVerificationBanner />

			<Suspense fallback={<DashboardLoading />}>
				<DashboardClient />
			</Suspense>
		</>
	)
}
