'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ShoppingCart, Clock } from 'lucide-react'

interface MenuItemCardProps {
	id: string
	name: string
	price: number
	quantity: number
}

export function MenuItemCard({ id, name, price, quantity }: MenuItemCardProps) {
	const isAvailable = quantity > 0
	const isLowStock = quantity > 0 && quantity <= 5

	return (
		<Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
						{name}
					</h3>
					{!isAvailable && (
						<Badge variant="secondary" className="ml-2 text-xs">
							Esgotado
						</Badge>
					)}
					{isLowStock && (
						<Badge
							variant="outline"
							className="ml-2 text-xs border-orange-300 text-orange-600"
						>
							Últimas unidades
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="flex-1 pb-3">
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-2xl font-bold text-green-600 dark:text-green-400">
							R$ {price}
						</span>
					</div>

					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<Clock className="w-4 h-4" />
						<span>
							{isAvailable
								? `${quantity} disponível${quantity !== 1 ? 'is' : ''}`
								: 'Indisponível'}
						</span>
					</div>
				</div>
			</CardContent>

			<CardFooter className="pt-0">
				<div className="w-full">
					{isAvailable ? (
						<div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
							<ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
							<span className="text-sm font-medium text-green-700 dark:text-green-300">
								Disponível para pedido
							</span>
						</div>
					) : (
						<div className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<span className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Temporariamente indisponível
							</span>
						</div>
					)}
				</div>
			</CardFooter>
		</Card>
	)
}
