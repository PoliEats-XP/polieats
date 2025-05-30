import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { generateOrderNumber } from '@/lib/utils'

interface ConfirmOrderCancelDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onClose: () => void
	deleteOrder: () => void
	orderId?: string
	isLoading?: boolean
}

export function ConfirmOrderCancelDialog({
	open,
	onOpenChange,
	onClose,
	deleteOrder,
	orderId,
	isLoading = false,
}: ConfirmOrderCancelDialogProps) {
	const orderNumber = orderId ? generateOrderNumber(orderId) : '0001'

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle className="sr-only">Cancelar Pedido</DialogTitle>
				<DialogHeader className="text-xl font-medium items-center">
					Você tem certeza?
				</DialogHeader>
				<p className="text-light text-center">
					Você está prestes a cancelar o Pedido #{orderNumber}, tem certeza?
					Essa ação não poderá ser desfeita
				</p>
				<div className="flex justify-between items-center mt-4 px-3">
					<Button
						onClick={deleteOrder}
						variant="outline"
						className="border-destructive text-destructive hover:bg-destructive hover:text-white cursor-pointer"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
								Cancelando...
							</>
						) : (
							'Sim, cancelar'
						)}
					</Button>
					<Button
						variant="outline"
						className="cursor-pointer"
						onClick={onClose}
						disabled={isLoading}
					>
						Fechar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
