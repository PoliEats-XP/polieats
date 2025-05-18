export interface MenuItem{
    id: number,
    nome: string
}

export interface OrderItem {
    id: number;
    quant: number;
    name: string;
}

export interface Order {
    items: Record<number, OrderItem>;
    total: number;
}
