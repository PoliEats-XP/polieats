import { EmailVerificationBanner } from '@/components/email-verification-banner'
import { Navbar } from '@/components/navbar'
import { OrderCard } from '@/components/order/order-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'PoliEats - Dashboard',
	description: 'Dashboard page for PoliEats',
}

export default function Dashboard() {
	const testOrder: {
		id: string
		status: 'PENDING' | 'COMPLETED' | 'CANCELED'
		date: string
		total: number
		items: { name: string; price: number; quantity: number }[]
	} = {
		id: '12345',
		date: '2023-10-01',
		status: 'PENDING',
		total: 100.0,
		items: [
			{ name: 'Item 1', price: 15, quantity: 2 },
			{ name: 'Item 2', price: 8, quantity: 1 },
		],
	}

	return (
		<>
			<EmailVerificationBanner />

			<Navbar variant="admin" />

			<OrderCard order={testOrder} />
		</>
	)
}
