import { EmailVerificationBanner } from '@/components/email-verification-banner'
import { Navbar } from '@/components/navbar'
import { OrdersTable } from '@/components/admin/orders-table'
import { OrdersStats } from '@/components/admin/orders-stats'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'PoliEats - Dashboard',
	description: 'Dashboard page for PoliEats',
}

export default function Dashboard() {
	return (
		<>
			<EmailVerificationBanner />

			<Navbar variant="admin" />

			<div className="container mx-auto p-6">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">
						Dashboard Administrativo
					</h1>
					<p className="text-muted-foreground">
						Gerencie todos os pedidos do sistema
					</p>
				</div>

				<div className="space-y-8">
					<OrdersStats />
					<OrdersTable />
				</div>
			</div>
		</>
	)
}
