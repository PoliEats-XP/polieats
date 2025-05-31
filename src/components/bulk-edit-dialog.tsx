'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface BulkEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	selectedItems: string[]
	items: Array<{
		id: string
		name: string
		quantity: number
		price: number
	}>
	onSave: (updates: {
		priceChange?: number
		quantityChange?: number
		newPrice?: number
		newQuantity?: number
	}) => void
}

export function BulkEditDialog({
	open,
	onOpenChange,
	selectedItems,
	items,
	onSave,
}: BulkEditDialogProps) {
	const [editMode, setEditMode] = useState<'absolute' | 'relative'>('relative')
	const [priceChange, setPriceChange] = useState<string>('')
	const [quantityChange, setQuantityChange] = useState<string>('')
	const [newPrice, setNewPrice] = useState<string>('')
	const [newQuantity, setNewQuantity] = useState<string>('')

	const selectedItemsData = items.filter((item) =>
		selectedItems.includes(item.id)
	)

	const handleSave = () => {
		const updates: any = {}

		if (editMode === 'relative') {
			if (priceChange) {
				const parsedPriceChange = Number.parseFloat(priceChange)
				if (!Number.isNaN(parsedPriceChange)) {
					updates.priceChange = parsedPriceChange
				}
			}
			if (quantityChange) {
				const parsedQuantityChange = Number.parseInt(quantityChange)
				if (!Number.isNaN(parsedQuantityChange)) {
					updates.quantityChange = parsedQuantityChange
				}
			}
		} else {
			if (newPrice) {
				const parsedNewPrice = Number.parseFloat(newPrice)
				if (!Number.isNaN(parsedNewPrice)) {
					updates.newPrice = parsedNewPrice
				}
			}
			if (newQuantity) {
				const parsedNewQuantity = Number.parseInt(newQuantity)
				if (!Number.isNaN(parsedNewQuantity)) {
					updates.newQuantity = parsedNewQuantity
				}
			}
		}

		onSave(updates)
		onOpenChange(false)

		// Reset form
		setPriceChange('')
		setQuantityChange('')
		setNewPrice('')
		setNewQuantity('')
	}

	const handleCancel = () => {
		onOpenChange(false)
		setPriceChange('')
		setQuantityChange('')
		setNewPrice('')
		setNewQuantity('')
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Editar em Lote</DialogTitle>
					<DialogDescription>
						Edite múltiplos itens de uma vez. As alterações serão aplicadas a
						todos os itens selecionados.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Selected Items Summary */}
					<div>
						<Label className="text-sm font-medium">
							Itens Selecionados ({selectedItems.length})
						</Label>
						<div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
							<div className="flex flex-wrap gap-1">
								{selectedItemsData.map((item) => (
									<Badge key={item.id} variant="secondary" className="text-xs">
										{item.name}
									</Badge>
								))}
							</div>
						</div>
					</div>

					<Separator />

					{/* Edit Mode Toggle */}
					<div>
						<Label className="text-sm font-medium">Modo de Edição</Label>
						<div className="mt-2 flex flex-col sm:flex-row gap-2">
							<Button
								variant={editMode === 'relative' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setEditMode('relative')}
								className="flex-1"
							>
								Alteração Relativa
							</Button>
							<Button
								variant={editMode === 'absolute' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setEditMode('absolute')}
								className="flex-1"
							>
								Valor Absoluto
							</Button>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{editMode === 'relative'
								? 'Adicione ou subtraia valores dos itens existentes'
								: 'Defina novos valores para todos os itens selecionados'}
						</p>
					</div>

					{/* Price Edit */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="price" className="text-sm font-medium">
								{editMode === 'relative' ? 'Alterar Preço (±)' : 'Novo Preço'}
							</Label>
							<div className="relative">
								{editMode === 'relative' && (
									<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
										±
									</span>
								)}
								<Input
									id="price"
									type="number"
									step="0.01"
									placeholder={editMode === 'relative' ? '0.00' : 'Novo preço'}
									value={editMode === 'relative' ? priceChange : newPrice}
									onChange={(e) =>
										editMode === 'relative'
											? setPriceChange(e.target.value)
											: setNewPrice(e.target.value)
									}
									className={editMode === 'relative' ? 'pl-8' : ''}
								/>
							</div>
							{editMode === 'relative' && (
								<p className="text-xs text-muted-foreground mt-1">
									Use valores negativos para diminuir
								</p>
							)}
						</div>

						{/* Quantity Edit */}
						<div>
							<Label htmlFor="quantity" className="text-sm font-medium">
								{editMode === 'relative'
									? 'Alterar Quantidade (±)'
									: 'Nova Quantidade'}
							</Label>
							<div className="relative">
								{editMode === 'relative' && (
									<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
										±
									</span>
								)}
								<Input
									id="quantity"
									type="number"
									placeholder={
										editMode === 'relative' ? '0' : 'Nova quantidade'
									}
									value={editMode === 'relative' ? quantityChange : newQuantity}
									onChange={(e) =>
										editMode === 'relative'
											? setQuantityChange(e.target.value)
											: setNewQuantity(e.target.value)
									}
									className={editMode === 'relative' ? 'pl-8' : ''}
								/>
							</div>
							{editMode === 'relative' && (
								<p className="text-xs text-muted-foreground mt-1">
									Use valores negativos para diminuir
								</p>
							)}
						</div>
					</div>

					{/* Preview */}
					{((editMode === 'relative' && (priceChange || quantityChange)) ||
						(editMode === 'absolute' && (newPrice || newQuantity))) && (
						<div className="border rounded-md p-3 bg-muted/50">
							<Label className="text-sm font-medium">
								Prévia das Alterações
							</Label>
							<div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
								{selectedItemsData.slice(0, 3).map((item) => {
									// Safe parsing with fallbacks
									const priceChangeValue = priceChange
										? Number.parseFloat(priceChange)
										: 0
									const newPriceValue = newPrice
										? Number.parseFloat(newPrice)
										: 0
									const quantityChangeValue = quantityChange
										? Number.parseInt(quantityChange)
										: 0
									const newQuantityValue = newQuantity
										? Number.parseInt(newQuantity)
										: 0

									const calculatedPrice =
										editMode === 'relative'
											? Number(item.price) +
												(Number.isNaN(priceChangeValue) ? 0 : priceChangeValue)
											: Number.isNaN(newPriceValue)
												? Number(item.price)
												: newPriceValue

									const calculatedQuantity =
										editMode === 'relative'
											? Number(item.quantity) +
												(Number.isNaN(quantityChangeValue)
													? 0
													: quantityChangeValue)
											: Number.isNaN(newQuantityValue)
												? Number(item.quantity)
												: newQuantityValue

									// Ensure we have valid numbers before formatting
									const safeCurrentPrice = Number(item.price) || 0
									const safeFinalPrice = Number(calculatedPrice) || 0
									const safeCalculatedQuantity = Number(calculatedQuantity) || 0

									return (
										<div
											key={item.id}
											className="text-xs flex flex-col sm:flex-row justify-between gap-1"
										>
											<span className="font-medium truncate">{item.name}</span>
											<span className="text-muted-foreground text-right">
												R$ {safeCurrentPrice.toFixed(2)} → R${' '}
												{safeFinalPrice.toFixed(2)} | {item.quantity} →{' '}
												{safeCalculatedQuantity}
											</span>
										</div>
									)
								})}
								{selectedItemsData.length > 3 && (
									<div className="text-xs text-muted-foreground">
										... e mais {selectedItemsData.length - 3} itens
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={handleCancel}
						className="w-full sm:w-auto"
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSave}
						disabled={
							editMode === 'relative'
								? !priceChange && !quantityChange
								: !newPrice && !newQuantity
						}
						className="w-full sm:w-auto"
					>
						Aplicar Alterações
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
