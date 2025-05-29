'use client'
import { authClient } from '@/lib/auth-client'
import { useRef, useState, useEffect } from 'react'
import { Bot, User, Send, RotateCcw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useOrderCompletedMutation } from '@/utils/mutations'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

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

export function Chatbot() {
	const [inputValue, setInputValue] = useState<string>('')
	const [conversation, setConversation] = useState<Conversation[]>([])
	const [orderState, setOrderState] = useState<OrderState>({
		currentOrder: {},
		orderConfirmed: false,
	})
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isTyping, setIsTyping] = useState<boolean>(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const { data: session } = authClient.useSession()

	// React Query setup for order mutations
	const queryClient = useQueryClient()
	const { orderCompletedMutation } = useOrderCompletedMutation(queryClient)

	// Rola para a última mensagem
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [conversation, isTyping])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	const handleSendMessage = async () => {
		if (!inputValue.trim() || isLoading) return

		try {
			setIsLoading(true)
			setIsTyping(true)
			const userMessage = { role: 'user', content: inputValue }
			const updatedConversation = [...conversation, userMessage]

			setConversation(updatedConversation)
			setInputValue('')

			const response = await fetch('/api/chatbot', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: session?.user.id,
					messages: updatedConversation,
					currentOrder: orderState.currentOrder,
				}),
			})

			const data = await response.json()

			console.log('API Response data:', {
				orderConfirmed: data.orderConfirmed,
				paymentMethod: data.paymentMethod,
				total: data.total,
				status: data.status,
				currentOrder: data.currentOrder,
				message: data.message,
			})

			console.log('Current orderState before updating:', orderState)

			// Simulate typing delay
			await new Promise((resolve) => setTimeout(resolve, 1000))
			setIsTyping(false)

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
					setOrderState({
						currentOrder: {},
						orderConfirmed: false,
						total: 0,
						paymentMethod: undefined,
						orderSummary: undefined,
						status: undefined,
					})
				}
			} else {
				setConversation([
					...updatedConversation,
					{
						role: 'assistant',
						content: data.message,
					},
				])

				// Handle order cancellation (now returns success status)
				if (
					data.orderCancelled ||
					data.message.includes(
						'Pedido cancelado. Se quiser começar de novo, é só me avisar.'
					)
				) {
					setOrderState({
						currentOrder: {},
						orderConfirmed: false,
						total: 0,
						paymentMethod: undefined,
						orderSummary: undefined,
						status: undefined,
					})
				} else {
					// Atualiza o estado do pedido se retornado pelo backend
					if (data.currentOrder) {
						setOrderState((prev) => ({
							...prev,
							currentOrder: data.currentOrder.items || data.currentOrder,
						}))
					}
				}

				// Only update order state if order was not cancelled
				if (
					!data.orderCancelled &&
					!data.message.includes(
						'Pedido cancelado. Se quiser começar de novo, é só me avisar.'
					)
				) {
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
						console.log(
							'Previous orderConfirmed state:',
							orderState.orderConfirmed
						)
						setOrderState((prev) => {
							const newState = {
								...prev,
								orderConfirmed: data.orderConfirmed,
								status: data.orderConfirmed ? 'COMPLETED' : 'PENDING',
							}
							console.log(
								'Setting new orderConfirmed state:',
								newState.orderConfirmed
							)
							console.log('Complete new orderState:', newState)
							return newState
						})

						// Trigger order refresh when order is confirmed
						if (data.orderConfirmed && !orderState.orderConfirmed) {
							console.log('Order confirmed! Refreshing orders list...')
							orderCompletedMutation.mutate()
						}
					}

					// Atualiza o método de pagamento se vier do backend
					if (
						data.paymentMethod !== undefined &&
						data.paymentMethod !== null &&
						data.paymentMethod !== 'INDEFINIDO'
					) {
						console.log('Payment method from API:', data.paymentMethod)
						setOrderState((prev) => ({
							...prev,
							paymentMethod: data.paymentMethod,
						}))
					} else if (data.paymentMethod === 'INDEFINIDO') {
						// Explicitly set INDEFINIDO if that's what we got
						setOrderState((prev) => ({
							...prev,
							paymentMethod: 'INDEFINIDO',
						}))
					}
				}
			}
		} catch (error) {
			console.error('Error:', error)
			setIsTyping(false)
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
		setOrderState({
			currentOrder: {},
			orderConfirmed: false,
			total: 0,
			paymentMethod: undefined,
			orderSummary: undefined,
			status: undefined,
		})
		setInputValue('')
		setIsTyping(false)
		inputRef.current?.focus()

		console.log('orderState', orderState)
	}

	// Typing indicator component
	const TypingIndicator = () => (
		<div className="flex items-start gap-3 mb-4">
			<div className="flex-shrink-0">
				<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
					<Bot className="w-4 h-4 text-primary-foreground" />
				</div>
			</div>
			<div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 max-w-xs">
				<div className="flex space-x-1">
					<div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
					<div
						className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
						style={{ animationDelay: '0.1s' }}
					></div>
					<div
						className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
						style={{ animationDelay: '0.2s' }}
					></div>
				</div>
			</div>
		</div>
	)

	// Message bubble component
	const MessageBubble = ({ role, content }: Conversation) => {
		const isAssistant = role === 'assistant'

		return (
			<div
				className={`flex items-start gap-2 mb-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
			>
				<div className="flex-shrink-0">
					{isAssistant ? (
						<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
							<Bot className="w-4 h-4 text-primary-foreground" />
						</div>
					) : (
						<Avatar className="w-8 h-8">
							<AvatarImage
								src={
									session?.user.image ||
									'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
								}
								alt={session?.user.name || 'User'}
							/>
							<AvatarFallback className="bg-secondary text-secondary-foreground">
								{session?.user.name?.charAt(0).toUpperCase() || (
									<User className="w-4 h-4" />
								)}
							</AvatarFallback>
						</Avatar>
					)}
				</div>
				<div
					className={`rounded-2xl px-3 py-2 max-w-xs ${
						isAssistant
							? 'bg-muted text-muted-foreground rounded-tl-sm'
							: 'bg-primary text-primary-foreground rounded-tr-sm'
					}`}
				>
					<div className="whitespace-pre-wrap text-sm">{content}</div>
				</div>
			</div>
		)
	}

	console.log('orderState', orderState.currentOrder)

	return (
		<div className="flex flex-col h-full bg-card rounded-xl border shadow-sm overflow-hidden">
			{/* Header */}
			<div className="border-b px-6 py-4 flex-shrink-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
							<Bot className="w-4 h-4 text-primary-foreground" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-card-foreground">
								Assistente de Pedidos
							</h2>
							<p className="text-xs text-muted-foreground">Online</p>
						</div>
					</div>
					<button
						onClick={resetConversation}
						disabled={isLoading}
						className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
					>
						<RotateCcw className="w-3 h-3" />
						Novo
					</button>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto">
				<div className="px-6 py-4">
					{conversation.length === 0 ? (
						<div className="text-center py-8">
							<div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
								<Bot className="w-6 h-6 text-primary" />
							</div>
							<h3 className="text-sm font-medium text-card-foreground mb-1">
								Bem-vindo!
							</h3>
							<p className="text-xs text-muted-foreground">
								Digite seu pedido para começar...
							</p>
						</div>
					) : (
						<>
							{conversation.map((msg, index) => (
								<MessageBubble
									key={index}
									role={msg.role}
									content={msg.content}
								/>
							))}
							{isTyping && <TypingIndicator />}
						</>
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input Area */}
			<div className="border-t px-6 py-4 flex-shrink-0">
				<div className="flex items-end gap-2">
					<div className="flex-1">
						<input
							ref={inputRef}
							type="text"
							placeholder={
								orderState.orderConfirmed
									? 'Pedido confirmado'
									: isLoading
										? 'Processando...'
										: 'Digite sua mensagem...'
							}
							className="w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50"
							value={inputValue}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							disabled={isLoading || orderState.orderConfirmed}
						/>
					</div>
					<button
						onClick={handleSendMessage}
						disabled={
							isLoading || !inputValue.trim() || orderState.orderConfirmed
						}
						className="flex items-center justify-center w-10 h-10 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-xl transition-colors disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
						) : (
							<Send className="w-4 h-4 text-primary-foreground" />
						)}
					</button>
				</div>
			</div>

			{/* Order Summary - Compact version for component */}
			{(Object.keys(orderState.currentOrder).length > 0 ||
				orderState.orderSummary) && (
				<div className="border-t px-6 py-4 bg-muted/50 flex-shrink-0">
					<h3 className="text-sm font-semibold text-card-foreground mb-3">
						Pedido Atual
					</h3>

					{/* Display formatted order summary if available */}
					{orderState.orderSummary &&
					orderState.orderSummary !== 'Nenhum item no pedido.' ? (
						<div className="whitespace-pre-line text-xs text-muted-foreground">
							{orderState.orderSummary}
						</div>
					) : (
						<>
							<div className="space-y-2">
								{Object.entries(orderState.currentOrder).map(([id, item]) => (
									<div
										key={id}
										className="flex justify-between items-center py-1 border-b border-border"
									>
										<div>
											<p className="text-xs font-medium text-card-foreground">
												{item.name ? item.name : `Item ${id}`}
											</p>
											<p className="text-xs text-muted-foreground">
												Qtd: {item.quant}
											</p>
										</div>
										{item.price && (
											<p className="text-xs font-medium text-card-foreground">
												R$ {(Number(item.price) * item.quant).toFixed(2)}
											</p>
										)}
									</div>
								))}
							</div>
							{/* Exibe o total se estiver disponível no estado */}
							{orderState.total !== undefined && (
								<div className="mt-3 pt-2 border-t border-border">
									<div className="flex justify-between items-center">
										<span className="text-sm font-semibold text-card-foreground">
											Total:
										</span>
										<span className="text-sm font-semibold text-card-foreground">
											R$ {orderState.total.toFixed(2)}
										</span>
									</div>
								</div>
							)}
						</>
					)}

					<div className="mt-3 pt-2 border-t border-border space-y-1">
						{/* Exibe o método de pagamento se estiver definido */}
						{orderState.paymentMethod &&
							orderState.paymentMethod !== 'INDEFINIDO' && (
								<div className="flex items-center justify-between">
									<span className="text-xs font-medium text-muted-foreground">
										Pagamento:
									</span>
									<span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
										{orderState.paymentMethod === 'CREDIT_CARD' &&
											'Cartão de Crédito'}
										{orderState.paymentMethod === 'DEBIT_CARD' &&
											'Cartão de Débito'}
										{orderState.paymentMethod === 'CASH' && 'Dinheiro'}
										{orderState.paymentMethod === 'PIX' && 'PIX'}
									</span>
								</div>
							)}

						{/* Show payment method status if INDEFINIDO or not set */}
						{(!orderState.paymentMethod ||
							orderState.paymentMethod === 'INDEFINIDO') && (
							<div className="flex items-center justify-between">
								<span className="text-xs font-medium text-muted-foreground">
									Pagamento:
								</span>
								<span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-500/20">
									A definir
								</span>
							</div>
						)}

						{/* Show order status */}
						<div className="flex items-center justify-between">
							{orderState.orderConfirmed ?? (
								<>
									<span className="text-xs font-medium text-muted-foreground">
										Status:
									</span>
									<span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
										Em preparo
									</span>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
