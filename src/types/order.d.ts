export interface MenuItem {
	id: string
	nome: string
}

export interface OrderItem {
	id: string
	quant: number
	name: string
	price?: string | number
}

export interface Order {
	items: Record<string, OrderItem>
	total: number
	paymentMethod: string | null
	status?: string
}
