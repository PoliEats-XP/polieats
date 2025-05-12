import type { Metadata } from 'next'
import { DashboardClient } from '../../../components/dashboard-client'
import { EmailVerificationBanner } from '@/components/email-verification-banner'

export const metadata: Metadata = {
	title: 'PoliEats - Dashboard - Menu',
	description: 'Dashboard page for PoliEats - Menu',
}

export default function Dashboard() {
	return (
		<>
			<EmailVerificationBanner />

			<DashboardClient />
		</>
	)
}
