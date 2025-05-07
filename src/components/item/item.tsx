'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter } from '../ui/card'
import { MangeItemDialog } from './manage-item-dialog'

interface ItemProps {
	id: string
	name: string
	available_quantity: number
	price: number
}

export function Item({ id, name, available_quantity, price }: ItemProps) {
	const [open, onOpenChange] = useState(false)

	return (
		<>
			<Card className="flex flex-col justify-between h-full rounded-sm">
				<CardContent className="p-2 -mt-6 ml-1">
					<h2 className="text-xl font-bold text-black dark:text-white">
						{name}
					</h2>
					<p className="text-[#7d7d7d] mt-2 font-light">
						Quantidade disponível: {available_quantity}
					</p>
					<p className=" text-[#7d7d7d] font-light">Preço: R$ {price}</p>
				</CardContent>
				<CardFooter className="p-2 pt-0 -mb-4 justify-end">
					<Button
						variant="outline"
						className="w-28 text-xs py-1 rounded-sm cursor-pointer"
						onClick={() => onOpenChange(true)}
					>
						Ver Detalhes
					</Button>
				</CardFooter>
			</Card>
			<MangeItemDialog
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
