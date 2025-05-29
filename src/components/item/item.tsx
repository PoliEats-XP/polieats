'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { ManageItem } from './manage-item'

interface ItemProps {
	id: string
	name: string
	available_quantity: number
	price: number
	isSelected?: boolean
	onSelect?: (id: string) => void
	showCheckbox?: boolean
}

export function Item({
	id,
	name,
	available_quantity,
	price,
	isSelected = false,
	onSelect,
	showCheckbox = false,
}: ItemProps) {
	const [open, onOpenChange] = useState(false)

	return (
		<>
			<Card className="flex flex-col justify-between h-full rounded-sm relative group">
				{/* Checkbox - visible only on hover and when showCheckbox is true */}
				{showCheckbox && (
					<div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<Checkbox
							checked={isSelected}
							onCheckedChange={() => onSelect?.(id)}
							className="bg-white dark:bg-gray-800 border-2 shadow-sm"
						/>
					</div>
				)}

				<CardContent className="p-2 -mt-6 ml-1">
					<h2 className="text-xl font-bold text-black dark:text-white">
						{name}
					</h2>
					<p className="text-midgray mt-2 font-light">
						Quantidade disponível: {available_quantity}
					</p>
					<p className=" text-midgray font-light">
						Preço: R$ {Number(price).toFixed(2)}
					</p>
				</CardContent>
				<CardFooter className="p-2 pt-0 -mb-4 flex justify-between items-center">
					{/* Stock Status Badges - aligned with button */}
					<div className="flex flex-col gap-1">
						{available_quantity === 0 && (
							<Badge
								variant="destructive"
								className="text-xs bg-red-500 text-white border-red-600 shadow-sm"
							>
								Esgotado
							</Badge>
						)}
						{available_quantity > 0 && available_quantity <= 5 && (
							<Badge
								variant="outline"
								className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700 shadow-sm"
							>
								Estoque Baixo
							</Badge>
						)}
					</div>
					<Button
						variant="outline"
						className="w-28 text-xs py-1 rounded-sm cursor-pointer"
						onClick={() => onOpenChange(true)}
					>
						Ver Detalhes
					</Button>
				</CardFooter>
			</Card>
			<ManageItem
				item_id={id}
				open={open}
				onOpenChange={onOpenChange}
				item_available_quantity={available_quantity}
				item_name={name}
				item_price={price}
			/>
		</>
	)
}
