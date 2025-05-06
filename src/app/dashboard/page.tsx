import { Navbar } from '@/components/navbar'
import { OrderCard } from '@/components/order-card'

export default function Dashboard() {
	const testOrder = {
		id: '12345',
		date: '2023-10-01',
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
