'use client'

import { useState, useEffect } from 'react'
import { useMediaQuery, useIsMounted } from '@/hooks'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { DialogHeader } from './ui/dialog'
import { useTheme } from 'next-themes'
import { OrderStatusBadge } from './order-status-badge'
import { ConfirmOrderCancelDialog } from './confirm-order-cancel-dialog'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from './ui/drawer'

interface OrderDetailsProps {
	order: {
		id: string
		status: 'PENDING' | 'COMPLETED' | 'CANCELED'
		date: string
		total: number
		items: { name: string; price: number; quantity: number }[]
	}
}

export function OrderDetails({ order }: OrderDetailsProps) {
	const [open, setOpen] = useState(false)
	const [openConfirmation, setOpenConfirmation] = useState(false)
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null) // Estado inicial neutro
	const isMounted = useIsMounted()
	const mediaQueryResult = useMediaQuery('(min-width: 768px)')
	const { theme } = useTheme()

	// Determina isDesktop apenas no cliente, após montagem
	useEffect(() => {
		if (isMounted()) {
			setIsDesktop(mediaQueryResult)
		}
	}, [mediaQueryResult, isMounted])

	function handleOpenConfirmation() {
		setOpenConfirmation(true)
		setOpen(false)
	}

	function handleDeleteOrder() {}

	// Enquanto isDesktop for null (não determinado), renderiza apenas o botão
	if (!isMounted() || isDesktop === null) {
		return (
			<Button
				variant="outline"
				className="cursor-pointer"
				onClick={() => setOpen(true)}
			>
				Ver Detalhes
			</Button>
		)
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button variant="outline" className="cursor-pointer">
							Ver Detalhes
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle className="sr-only">Detalhes do pedido</DialogTitle>
						<DialogHeader className="flex flex-col gap-1 text-2xl font-medium">
							Detalhes do Pedido
							<p className="text-lg font-light text-black dark:text-white -mt-2">
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
							<div className="flex items-center justify-between p-2 mt-8">
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
					</DialogContent>
				</Dialog>
				<ConfirmOrderCancelDialog
					onOpenChange={setOpenConfirmation}
					open={openConfirmation}
					onClose={() => setOpenConfirmation(false)}
					deleteOrder={handleDeleteOrder}
				/>
			</>
		)
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button variant="outline" className="cursor-pointer">
					Ver Detalhes
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerTitle className="sr-only">Detalhes do pedido</DrawerTitle>
				<DrawerHeader className="flex flex-col gap-1 text-2xl font-medium">
					Detalhes do Pedido
					<p className="text-lg font-light text-black dark:text-white -mt-2">
						Confira alguns detalhes do Pedido {order.id}
					</p>
					<OrderStatusBadge className="mt-3" status={order.status} />
				</DrawerHeader>
				<div className="px-4 pb-4">
					{order.items.map((item, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-2 border rounded-md mb-2"
						>
							<p>
								{item.name} - R${item.price}
							</p>
							<p>{item.quantity}</p>
						</div>
					))}
					{order.status === 'PENDING' ? (
						<>
							<p className="text-xl mt-4">Total: R${order.total}</p>
							<div className="flex items-center justify-between mt-4 mb-4">
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
						<div className="flex items-center justify-between mt-8 mb-4">
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
				</div>
			</DrawerContent>
		</Drawer>
	)
}
