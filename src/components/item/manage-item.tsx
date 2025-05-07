import { useIsMounted, useMediaQuery } from '@/hooks'
import { useEffect, useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { ItemForm } from './item-form'
import type { z } from 'zod'
import type { itemFormSchema } from '@/lib/schemas/menu.schemas'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer'

type ManageItemProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	item_id: string
	item_name: string
	item_price: number
	item_available_quantity: number
}

export function ManageItem({
	item_available_quantity,
	item_id,
	item_name,
	item_price,
	onOpenChange,
	open,
}: ManageItemProps) {
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
	const isMounted = useIsMounted()
	const mediaQueryResult = useMediaQuery('(min-width: 768px)')

	useEffect(() => {
		if (isMounted()) {
			setIsDesktop(mediaQueryResult)
		}
	}, [mediaQueryResult, isMounted])

	async function onSubmit(values: z.infer<typeof itemFormSchema>) {}

	if (isDesktop) {
		return (
			<Dialog onOpenChange={onOpenChange} open={open}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-2xl font-medium">
							{item_name}
						</DialogTitle>
						<DialogDescription className="text-lg font-light">
							Alguns detalhes sobre este item
						</DialogDescription>
					</DialogHeader>
					<ItemForm
						onSubmit={onSubmit}
						id={item_id}
						item_price={item_price}
						item_name={item_name}
						item_available_quantity={item_available_quantity}
						onOpenChange={onOpenChange}
					/>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<div className="flex justify-center px-2 sm:px-4 md:px-0">
				<DrawerContent
					className="w-full max-w-md
                                 border-x border-b
                                 rounded-t-lg sm:rounded-lg
                                 p-4 sm:p-6 md:p-8"
				>
					<DrawerHeader className="flex flex-col gap-1 text-2xl font-medium p-0 pt-6">
						<DrawerTitle>{item_name}</DrawerTitle>
						<p className="text-lg font-light text-black dark:text-white -mt-2 pb-6">
							Alguns detalhes sobre este item
						</p>
					</DrawerHeader>

					<ItemForm
						onSubmit={onSubmit}
						id={item_id}
						item_price={item_price}
						item_name={item_name}
						item_available_quantity={item_available_quantity}
						onOpenChange={onOpenChange}
					/>
				</DrawerContent>
			</div>
		</Drawer>
	)
}
