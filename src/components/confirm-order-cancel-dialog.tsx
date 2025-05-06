import { Button } from './ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'

interface ConfirmOrderCancelDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onClose: () => void
	deleteOrder: () => void
}

export function ConfirmOrderCancelDialog({
	open,
	onOpenChange,
	onClose,
	deleteOrder,
}: ConfirmOrderCancelDialogProps) {
	// TODO: Implement cancel order functionality

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle className="sr-only">Cancelar Pedido</DialogTitle>
				<DialogHeader className="text-xl font-medium items-center">
					Você tem certeza?
				</DialogHeader>
				<p className="text-light text-center">
					Você está prestes a cancelar o Pedido 0001, tem certeza? Essa ação não
					poderá ser desfeita
				</p>
				<div className="flex justify-between items-center mt-4 px-3">
					<Button
						onClick={deleteOrder}
						variant="outline"
						className="border-destructive text-destructive hover:bg-destructive hover:text-white cursor-pointer"
					>
						Sim, cancelar
					</Button>
					<Button
						variant="outline"
						className="cursor-pointer"
						onClick={onClose}
					>
						Fechar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
