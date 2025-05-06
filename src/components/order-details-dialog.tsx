'use client'

import { Dialog, DialogTrigger } from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { OrderStatusBadge } from './order-status-badge'
import { useTheme } from 'next-themes'
import { useState } from 'react'

interface OrderDetailsDialogProps {
	order: {
		id: string
		status: 'PENDING' | 'COMPLETED' | 'CANCELED'
		date: string
		total: number
		items: { name: string; price: number; quantity: number }[]
	}
}

export function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
	const [open, onOpenChange] = useState(false)

	// TODO: Implement cancel order functionality

	const { theme } = useTheme()

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger className="cursor-pointer" asChild>
				<Button variant="outline" className="cursor-pointer">
					Ver Detalhes
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle className="sr-only">Detalhes do pedido</DialogTitle>
				<DialogHeader className="flex flex-col gap-1 text-2xl font-medium">
					Detalhes do Pedido
					<p
						className={`text-lg font-light text-[${theme === 'dark' ? '#fff' : '#222'}] -mt-2`}
					>
						Confira alguns detalhes do Pedido {order.id}
					</p>
					<OrderStatusBadge className="mt-3" status={order.status} />
				</DialogHeader>
				{order.items.map((item, index) => (
					<div
						key={index}
						className="flex items-center justify-between p-2 border rounded-md"
					>
						<p>
							{item.name} - R${item.price}
						</p>
						<p>{item.quantity}</p>
					</div>
				))}

				{order.status === 'PENDING' ? (
					<>
						<p className="text-xl">Total: R${order.total}</p>

						<div className="flex items-center justify-between">
							<Button
								variant="outline"
								className="border-destructive text-destructive hover:bg-destructive hover:text-white cursor-pointer"
							>
								Cancelar pedido
							</Button>
							<Button
								className="cursor-pointer"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Fechar
							</Button>
						</div>
					</>
				) : (
					<div className="flex items-center justify-between p-2 mt-8">
						<p className="text-xl">Total: R${order.total}</p>

						<Button
							className="cursor-pointer"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Fechar
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
