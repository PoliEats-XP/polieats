import { Navbar } from '@/components/navbar'
import { OrderCard } from '@/components/order-card'

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
			<Navbar variant="admin" />

			<OrderCard order={testOrder} />
		</>
	)
}
