import { prisma } from './prisma'

export class OrderRepository {

    // validação(banco) para ver se Order existe
    private static async getValidatedOrder(orderId: string, status?: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            throw new Error('Order not found.');
        }

        if (status && order.status !== status) {
            throw new Error(`Order must be in ${status} status.`);
        }

        return order;
    }

    //Criar a order 
    static async createOrder(userId: string) {
        return await prisma.order.create({
            data: {
                userId: userId,
                totalPrice: 0,
            }
        });
    }

    //Pegar a order pelo orderId
    static async getOrderById(orderId: string) {
        await this.getValidatedOrder(orderId, 'PENDING');

        return await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
    }

    //Atualizar a quantidade dos items da order
    static async updateItemQuantity(orderId: string, itemId: string, quantity: number) {
        await this.getValidatedOrder(orderId, 'PENDING');

        return await prisma.orderItem.upsert({
            where: {
                orderId_itemId: { orderId, itemId }
            },
            update: {
                quantity: quantity
            },
            create: {
                orderId: orderId,
                itemId: itemId,
                quantity: quantity
            },
        });
    }

    //Limpar(deletar) todos os items da order 
    static async clearOrder(orderId: string) {
        await this.getValidatedOrder(orderId, 'PENDING');

        return await prisma.orderItem.deleteMany({
            where: { orderId: orderId },
        });
    }

    //Deletar a order 
    static async deleteOrder(orderId: string) {
        return await prisma.order.delete({
            where: { id: orderId },
        });
    }

    //Deletar um (ou vários) items em especifico da order 
    static async deleteOrderItem(orderId: string, itemId: string) {
        await this.getValidatedOrder(orderId, 'PENDING');

        return await prisma.orderItem.deleteMany({
            where: {
                orderId: orderId,
                itemId: itemId,
            },
        });
    }

    //Define o método de pagamento e o status da order como confirmed 
    static async confirmOrder(orderId: string, paymentMethod: string) {
        await this.getValidatedOrder(orderId, 'PENDING');

        return await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CONFIRMED',
                paymentMethod: paymentMethod
            },
        });
    }

    //Pega a grande parte dos status da order 
    static async orderStatus(orderId: string) {
        await this.getValidatedOrder(orderId, 'PENDING');

        return await prisma.order.findUnique({
            where: { id: orderId }
        });

    }

    //Define o status da order como cancelled 
    static async cancelOrder(orderId: string) {
        await this.getValidatedOrder(orderId, 'PENDING');

        return await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });
    }

    //Define o método de pagamento
    static async setPaymentMethod(orderId: string, paymentMethod: string): Promise<void> {
        await this.getValidatedOrder(orderId, 'PENDING');

        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentMethod: paymentMethod
            }
        });

    }

    //Calcula o total da order 
    static async calculateOrderTotal(orderId: string): Promise<number> {
        await this.getValidatedOrder(orderId, 'PENDING');

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { item: true } } },
        });

        const total = order.items.reduce(
            (sum: number, item: { quantity: number; item: { price: number; }; }) => sum + item.quantity * item.item.price,
            0
        );

        await prisma.order.update({
            where: { id: orderId },
            data: { totalPrice: total },
        });

        return total;
    }

    //Pega o total da order
    static async getTotalValue(orderId: string): Promise<number> {

        return await prisma.order.findUnique({
            where: { id: orderId },
            include: { totalPrice: true },
        });
    }
}