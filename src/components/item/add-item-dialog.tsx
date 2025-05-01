import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog'
import { AddItemForm } from './add-item-form'

type AddItemDialogProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function AddItemDialog({ onOpenChange, open }: AddItemDialogProps) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-2xl font-medium">
						Adicionar item
					</DialogTitle>
					<DialogDescription className="text-lg font-light">
						Adicione um novo item ao cardápio
					</DialogDescription>
				</DialogHeader>
				<AddItemForm />
			</DialogContent>
		</Dialog>
	)
}
