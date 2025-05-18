import { prisma } from './prisma'
import { MenuItem } from "../types/order.type"


export class MenuRepository {
  static async getMenuItems(): Promise<MenuItem[]> {
    const items = await prisma.item.findMany({
      select: {
        id: true,
        name: true,
      }
    });

    return items.map((item: { id: string; name: string; }) => ({
      id: item.id,
      nome: item.name,
    }));
  }
}

