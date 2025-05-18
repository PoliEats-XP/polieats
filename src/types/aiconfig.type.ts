export interface AIconfig{
    model: string,
    temperature: number,
    top_p: number
}

export interface APIResponse {
    status: 'sucess' | 'error',
    message: string,
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant',
    content: string
}
