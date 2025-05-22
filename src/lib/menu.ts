import { prisma } from './prisma'
import type { MenuItem } from '../types/order'
import type Decimal from 'decimal.js'

export class MenuRepository {
	static async getMenuItems(): Promise<MenuItem[] | any> {
		const items = await prisma.item.findMany({
			select: {
				id: true,
				name: true,
				price: true,
			},
		})

		return items.map((item: { id: string; name: string; price: Decimal }) => ({
			id: item.id,
			nome: item.name,
			preco: item.price,
		}))
	}
}
