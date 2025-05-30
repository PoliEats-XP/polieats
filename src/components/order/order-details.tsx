'use client'

import { useState, useEffect } from 'react'
import { useMediaQuery, useIsMounted } from '@/hooks'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { DialogHeader } from '../ui/dialog'
import { OrderStatusBadge } from './order-status-badge'
import { ConfirmOrderCancelDialog } from '../confirm-order-cancel-dialog'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '../ui/drawer'
import { OrderDetailsDrawerFooter } from './ui/details-footer'
import { DetailsItems } from './ui/details-items'
import { generateOrderNumber } from '@/lib/utils'
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

interface OrderDetailsProps {
	order: ActualOrder
}

export function OrderDetails({ order }: OrderDetailsProps) {
	const [open, setOpen] = useState(false)
	const [openConfirmation, setOpenConfirmation] = useState(false)
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
	const isMounted = useIsMounted()
	const mediaQueryResult = useMediaQuery('(min-width: 768px)')
	const orderNumber = generateOrderNumber(order.id)
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
								Confira alguns detalhes do Pedido #{orderNumber}
							</p>
							<OrderStatusBadge className="mt-3" status={order.status} />
						</DialogHeader>
						<DetailsItems order={order} component="dialog" />
						<OrderDetailsDrawerFooter
							handleOpenConfirmation={handleOpenConfirmation}
							component="dialog"
							order={order}
							setOpen={setOpen}
						/>
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
						Confira alguns detalhes do Pedido #{orderNumber}
					</p>
					<OrderStatusBadge className="mt-3" status={order.status} />
				</DrawerHeader>
				<div className="px-4 pb-4">
					<DetailsItems order={order} component="drawer" />
					<OrderDetailsDrawerFooter
						handleOpenConfirmation={handleOpenConfirmation}
						component="drawer"
						order={order}
						setOpen={setOpen}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
