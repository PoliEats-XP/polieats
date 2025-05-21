'use client'
import { authClient } from '@/lib/auth-client'
import { useRef, useState, useEffect } from 'react'

interface Conversation {
	role: string
	content: string
}

interface OrderState {
	currentOrder: Record<
		string,
		{ quant: number; name: string; id: string; price?: string | number }
	>
	orderConfirmed: boolean
	paymentMethod?: string
	total?: number
	orderSummary?: string
	status?: string
}

export default function ChatInterface() {
	const [inputValue, setInputValue] = useState<string>('')
	const [conversation, setConversation] = useState<Conversation[]>([])
	const [orderState, setOrderState] = useState<OrderState>({
		currentOrder: {},
		orderConfirmed: false,
	})
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const { data: session } = authClient.useSession()

	// Rola para a última mensagem
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [conversation])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	const handleSendMessage = async () => {
		if (!inputValue.trim() || isLoading) return

		try {
			setIsLoading(true)
			const userMessage = { role: 'user', content: inputValue }
			const updatedConversation = [...conversation, userMessage]

			setConversation(updatedConversation)
			setInputValue('')

			const response = await fetch('/api/chatbot', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: session?.user.id, // A DEFINIR
					messages: updatedConversation,
					currentOrder: orderState.currentOrder,
				}),
			})

			const data = await response.json()

			if (data.status === 'error') {
				setConversation([
					...updatedConversation,
					{
						role: 'assistant',
						content: data.message,
					},
				])

				if (
					data.message.includes(
						'Pedido cancelado. Se quiser começar de novo, é só me avisar.'
					)
				) {
					setOrderState({ currentOrder: {}, orderConfirmed: false })
				}
			} else {
				setConversation([
					...updatedConversation,
					{
						role: 'assistant',
						content: data.message,
					},
				])

				// Atualiza o estado do pedido se retornado pelo backend
				if (data.currentOrder) {
					setOrderState((prev) => ({
						...prev,
						currentOrder: data.currentOrder.items || data.currentOrder,
					}))
				}

				// Atualiza o total do pedido
				if (data.total !== undefined) {
					setOrderState((prev) => ({
						...prev,
						total: data.total,
					}))
				}

				// Atualiza o resumo do pedido se disponível
				if (data.orderSummary) {
					console.log('Received order summary:', data.orderSummary)
					setOrderState((prev) => ({
						...prev,
						orderSummary: data.orderSummary,
					}))
				}

				// Atualiza o status de confirmação se vier do backend
				if (data.orderConfirmed !== undefined) {
					console.log('Order confirmed status from API:', data.orderConfirmed)
					setOrderState((prev) => ({
						...prev,
						orderConfirmed: data.orderConfirmed,
						status: data.orderConfirmed ? 'COMPLETED' : 'PENDING',
					}))
				}

				// Atualiza o método de pagamento se vier do backend
				if (data.paymentMethod) {
					console.log('Payment method from API:', data.paymentMethod)
					setOrderState((prev) => ({
						...prev,
						paymentMethod: data.paymentMethod,
					}))
				}
			}
		} catch (error) {
			console.error('Error:', error)
			setConversation([
				...conversation,
				{
					role: 'assistant',
					content:
						'Desculpe, houve um erro ao processar sua solicitação. Tente novamente.',
				},
			])
		} finally {
			setIsLoading(false)
			inputRef.current?.focus()
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSendMessage()
		}
	}

	const resetConversation = () => {
		setConversation([])
		setOrderState({ currentOrder: {}, orderConfirmed: false })
		setInputValue('')
		inputRef.current?.focus()
	}

	// Componente de mensagem reutilizável
	const MessageBubble = ({ role, content }: Conversation) => {
		const isAssistant = role === 'assistant'
		return (
			<div className={`chat ${isAssistant ? 'chat-end' : 'chat-start'}`}>
				<div
					className={`chat-bubble ${isAssistant ? 'chat-bubble-secondary' : 'chat-bubble-primary'}`}
				>
					<strong className="badge badge-primary">
						{isAssistant ? 'Atendente' : 'Você'}
					</strong>
					<div className="mt-1 whitespace-pre-wrap">{content}</div>
				</div>
			</div>
		)
	}

	console.log('orderState', orderState.currentOrder)

	return (
		<div className="container mx-auto p-4 max-w-3xl">
			<h1 className="text-4xl font-bold text-center my-6">Faça seu Pedido</h1>

			{/* Área de conversa */}
			<div className="bg-base-200 rounded-lg p-4 h-96 overflow-y-auto mb-4">
				{conversation.length === 0 ? (
					<div className="text-center text-gray-500 h-full flex items-center justify-center">
						<p>Digite seu pedido para começar...</p>
					</div>
				) : (
					conversation.map((msg, index) => (
						<MessageBubble key={index} role={msg.role} content={msg.content} />
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Controles */}
			<div className="flex gap-2">
				<input
					ref={inputRef}
					type="text"
					placeholder={isLoading ? 'Processando...' : 'Digite sua mensagem...'}
					className="input input-bordered flex-1"
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					disabled={isLoading}
				/>
				<button
					className="btn btn-primary"
					onClick={handleSendMessage}
					disabled={isLoading || !inputValue.trim()}
				>
					{isLoading ? (
						<span className="loading loading-spinner"></span>
					) : (
						'Enviar'
					)}
				</button>
				<button className="btn btn-outline" onClick={resetConversation}>
					Novo Pedido
				</button>
			</div>

			{/* Resumo do Pedido*/}
			{(Object.keys(orderState.currentOrder).length > 0 ||
				orderState.orderSummary) && (
				<div className="mt-6 bg-base-100 p-4 rounded-lg shadow-md">
					<h2 className="text-xl font-bold mb-3">Seu Pedido Atual:</h2>

					{/* Display formatted order summary if available */}
					{orderState.orderSummary &&
					orderState.orderSummary !== 'Nenhum item no pedido.' ? (
						<div className="whitespace-pre-line">{orderState.orderSummary}</div>
					) : (
						<>
							<ul className="space-y-1">
								{Object.entries(orderState.currentOrder).map(([id, item]) => (
									<li key={id} className="flex justify-between">
										<span>
											{item.name ? item.name : `Item ${id}`}: {item.quant}x
										</span>
										{item.price ? (
											<span className="font-medium">
												R$ {(Number(item.price) * item.quant).toFixed(2)}
											</span>
										) : null}
									</li>
								))}
							</ul>
							{/* Exibe o total se estiver disponível no estado */}
							{orderState.total !== undefined && (
								<p className="mt-3 font-bold text-right">
									Total: R$ {orderState.total.toFixed(2)}
								</p>
							)}
						</>
					)}

					<div className="mt-4 pt-3 border-t border-gray-200">
						{/* Exibe o método de pagamento se estiver definido */}
						{orderState.paymentMethod && (
							<div className="flex items-center gap-2 mb-2">
								<span className="font-medium">Método de Pagamento:</span>
								<span className="badge badge-outline">
									{orderState.paymentMethod === 'CREDIT_CARD' &&
										'Cartão de Crédito'}
									{orderState.paymentMethod === 'DEBIT_CARD' &&
										'Cartão de Débito'}
									{orderState.paymentMethod === 'CASH' && 'Dinheiro'}
									{orderState.paymentMethod === 'PIX' && 'PIX'}
									{orderState.paymentMethod === 'INDEFINIDO' && 'A definir'}
								</span>
							</div>
						)}

						{/* Show order status */}
						<div className="flex items-center gap-2">
							<span className="font-medium">Status:</span>
							<span
								className={`badge ${orderState.orderConfirmed ? 'badge-success' : 'badge-primary'}`}
							>
								{orderState.orderConfirmed ? 'Confirmado' : 'Pendente'}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
