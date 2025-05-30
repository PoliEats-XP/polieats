import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface ConfirmBulkDeleteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onClose: () => void
	onConfirm: () => void
	selectedCount: number
	isLoading?: boolean
}

export function ConfirmBulkDeleteDialog({
	open,
	onOpenChange,
	onClose,
	onConfirm,
	selectedCount,
	isLoading = false,
}: ConfirmBulkDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle className="sr-only">Excluir Itens</DialogTitle>
				<DialogHeader className="text-xl font-medium items-center">
					Você tem certeza?
				</DialogHeader>
				<p className="text-light text-center">
					Você está prestes a excluir {selectedCount}{' '}
					{selectedCount === 1 ? 'item' : 'itens'} do cardápio. Essa ação não
					poderá ser desfeita.
				</p>
				<div className="flex justify-between items-center mt-4 px-3">
					<Button
						onClick={onConfirm}
						variant="outline"
						className="border-destructive text-destructive hover:bg-destructive hover:text-white cursor-pointer"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
								Excluindo...
							</>
						) : (
							'Sim, excluir'
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
