import type { Metadata } from 'next'
import { DashboardClient } from '../../../components/dashboard-client'

export const metadata: Metadata = {
	title: 'PoliEats - Dashboard - Menu',
	description: 'Dashboard page for PoliEats - Menu',
}

export default function Dashboard() {
	return <DashboardClient />
}
