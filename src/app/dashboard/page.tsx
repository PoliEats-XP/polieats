import { Navbar } from '@/components/navbar'
import { OrderCard } from '@/components/order-card'

export default function Dashboard() {
	const testOrder: {
		id: string
		status: 'PENDING' | 'COMPLETED' | 'CANCELED'
		date: string
		total: number
		items: { name: string; quantity: number }[]
	} = {
		id: '12345',
		date: '2023-10-01',
		status: 'CANCELED',
		total: 100.0,
		items: [
			{ name: 'Item 1', quantity: 2 },
			{ name: 'Item 2', quantity: 1 },
		],
	}

	return (
		<>
			<Navbar variant="admin" />

			<OrderCard order={testOrder} />
		</>
	)
}
