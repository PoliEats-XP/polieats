import type { z } from 'zod'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { ItemForm } from './item-form'
import type { itemFormSchema } from '@/lib/schemas/menu.schemas'

type ManageItemDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	item_id: string
	item_name: string
	item_price: number
	item_available_quantity: number
}

export function MangeItemDialog({
	onOpenChange,
	open,
	item_id,
	item_available_quantity,
	item_name,
	item_price,
}: ManageItemDialogProps) {
	async function onSubmit(values: z.infer<typeof itemFormSchema>) {}

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
