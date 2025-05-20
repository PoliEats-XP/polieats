export interface Order {
	order: {
		id: string
		status: 'PENDING' | 'COMPLETED' | 'CANCELED'
		date: string
		total: number
		item: { name: string; price: number; quantity: number }[]
	}
}

export interface AIconfig {
	model: string
	temperature: number
	top_p: number
}

export interface APIResponse {
	status: 'sucess' | 'error'
	message: string
}

export interface ChatMessage {
	role: 'system' | 'user' | 'assistant'
	content: string
}
