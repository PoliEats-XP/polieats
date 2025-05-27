export interface AdminOrderItem {
	name: string
	price: number
	quantity: number
}

export interface AdminOrder {
	id: string
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'
	date: string
	total: number
	paymentMethod:
		| 'CASH'
		| 'CREDIT_CARD'
		| 'DEBIT_CARD'
		| 'PIX'
		| 'INDEFINIDO'
		| null
	user: {
		id: string
		name: string
		email: string
	}
	itemCount: number
	items: AdminOrderItem[]
	rating?: number | null
	feedback?: string | null
	feedbackAt?: string | null
}

export interface AdminOrdersResponse {
	orders: AdminOrder[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasMore: boolean
	}
}

export type OrderStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELED'
