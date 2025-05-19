import { prisma } from './prisma'
import type { MenuItem } from '../types/order'

export class MenuRepository {
	static async getMenuItems(): Promise<MenuItem[] | any> {
		const items = await prisma.item.findMany({
			select: {
				id: true,
				name: true,
			},
		})

		return items.map((item: { id: string; name: string }) => ({
			id: item.id,
			nome: item.name,
		}))
	}
}
