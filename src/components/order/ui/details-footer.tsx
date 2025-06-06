import { Button } from '@/components/ui/button'
// Define the actual order structure being used
interface OrderItem {
	name: string
	price: number
	quantity: number
}

interface ActualOrder {
	id: string
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
	date: string
	total: number
	item: OrderItem[]
	rating?: number | null
	feedback?: string | null
	feedbackAt?: string | null
	paymentMethod?: string | null
}

interface OrderProps {
	handleOpenConfirmation: () => void
	setOpen: (open: boolean) => void
	component: 'drawer' | 'dialog'
	order: ActualOrder
}

export function OrderDetailsDrawerFooter({
	order,
	handleOpenConfirmation,
	setOpen,
	component,
}: OrderProps) {
	return (
		<>
			{order.status === 'PENDING' ? (
				<>
					<p className={`text-xl ${component === 'drawer' ? 'mt-4' : ''}`}>
						Total: R${order.total}
					</p>
					<div
						className={`flex items-center justify-between ${component === 'drawer' ? 'mt-4 mb-4' : ''}`}
					>
						<Button
							variant="outline"
							className="border-destructive text-destructive hover:bg-destructive hover:text-white cursor-pointer"
							onClick={handleOpenConfirmation}
						>
							Cancelar pedido
						</Button>
						<Button
							className="cursor-pointer"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Fechar
						</Button>
					</div>
				</>
			) : (
				<div
					className={`flex items-center justify-between p-2 mt-8 ${component === 'drawer' ? 'mb-4' : ''}`}
				>
					<p className="text-xl">Total: R${order.total}</p>
					<Button
						className="cursor-pointer"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Fechar
					</Button>
				</div>
			)}
		</>
	)
}
