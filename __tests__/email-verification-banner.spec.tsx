import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailVerificationBanner } from '@/components/email-verification-banner'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

jest.mock('sonner', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}))

jest.mock('@/lib/auth-client', () => ({
	authClient: {
		useSession: jest.fn(() => ({
			data: {
				user: {
					emailVerified: false,
					email: 'test@example.com',
				},
			},
		})),
		sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
	},
}))

describe('EmailVerificationBanner', () => {
	const user = userEvent.setup()

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('não renderiza o banner se o e-mail do usuário estiver verificado', () => {
		jest.mocked(authClient.useSession as jest.Mock).mockReturnValue({
			data: {
				user: {
					emailVerified: true,
					email: 'test@example.com',
				},
			},
		})

		render(<EmailVerificationBanner />)
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	})

	it('renderiza o banner se o e-mail do usuário não estiver verificado', () => {
		jest.mocked(authClient.useSession as jest.Mock).mockReturnValue({
			data: {
				user: {
					emailVerified: false,
					email: 'test@example.com',
				},
			},
		})

		render(<EmailVerificationBanner />)
		expect(screen.getByRole('alert')).toBeInTheDocument()
		expect(
			screen.getByText(/Seu e-mail ainda não está verificado./)
		).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /Enviar e-mail de verificação/ })
		).toBeInTheDocument()
	})

	it('envia o e-mail de verificação e exibe toast de sucesso ao clicar no botão', async () => {
		jest.mocked(authClient.useSession as jest.Mock).mockReturnValue({
			data: {
				user: {
					emailVerified: false,
					email: 'test@example.com',
				},
			},
		})
		jest.mocked(toast.success).mockImplementation(() => 'mocked-toast-id')

		render(<EmailVerificationBanner />)
		const button = screen.getByRole('button', {
			name: /Enviar e-mail de verificação/,
		})
		await user.click(button)

		await waitFor(() => {
			expect(authClient.sendVerificationEmail).toHaveBeenCalledWith({
				email: 'test@example.com',
				callbackURL: '/',
			})
			expect(toast.success).toHaveBeenCalledWith(
				'Um e-mail de verificação foi enviado para você. Verifique sua caixa de entrada!'
			)
		})
	})

	it('exibe toast de erro se falhar ao enviar o e-mail de verificação', async () => {
		jest.mocked(authClient.useSession as jest.Mock).mockReturnValue({
			data: {
				user: {
					emailVerified: false,
					email: 'test@example.com',
				},
			},
		})
		jest
			.mocked(authClient.sendVerificationEmail)
			.mockRejectedValue(new Error('Erro'))
		jest.mocked(toast.error).mockImplementation(() => 'mocked-toast-id')
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {})

		render(<EmailVerificationBanner />)
		const button = screen.getByRole('button', {
			name: /Enviar e-mail de verificação/,
		})
		await user.click(button)

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				'Ocorreu um erro ao enviar o e-mail de verificação. Tente novamente mais tarde.'
			)
		})

		consoleErrorSpy.mockRestore()
	})

	it('não renderiza o banner se a sessão for null', () => {
		jest
			.mocked(authClient.useSession as jest.Mock)
			.mockReturnValue({ data: null })

		render(<EmailVerificationBanner />)
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	})
})
