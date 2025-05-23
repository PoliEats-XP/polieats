import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from '@/components/auth/login-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/hooks/useAuthState'
import { signIn } from '@/lib/auth-client'
import { Turnstile as ActualTurnstile } from '@marsidev/react-turnstile'
import React from 'react'

jest.mock('sonner', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}))

jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}))

let mockAuthInternalState = {
	loading: false,
	error: null,
	success: null,
}
const mockSetLoading = jest.fn((isLoading) => {
	mockAuthInternalState.loading = isLoading
})
const mockSetSuccess = jest.fn((message) => {
	mockAuthInternalState.success = message
	mockAuthInternalState.loading = false
})
const mockSetError = jest.fn((message) => {
	mockAuthInternalState.error = message
	mockAuthInternalState.loading = false
})
const mockResetState = jest.fn(() => {
	mockAuthInternalState = { loading: false, error: null, success: null }
})

jest.mock('@/hooks/useAuthState', () => ({
	useAuthState: jest.fn(() => ({
		loading: mockAuthInternalState.loading,
		setLoading: mockSetLoading,
		setSuccess: mockSetSuccess,
		setError: mockSetError,
		resetState: mockResetState,
	})),
}))

jest.mock('@/lib/auth-client', () => ({
	signIn: {
		email: jest.fn(),
		social: jest.fn(),
	},
}))

jest.mock('@marsidev/react-turnstile', () => ({
	Turnstile: jest.fn((props: any) => {
		React.useEffect(() => {
			if (props.onSuccess && typeof props.onSuccess === 'function') {
				props.onSuccess('mocked-captcha-token-for-test')
			}
		}, [props.onSuccess])
		return <div data-testid="turnstile" />
	}),
}))

describe('Login Form', () => {
	const pushMock = jest.fn()

	beforeEach(() => {
		jest.clearAllMocks()
		mockAuthInternalState = { loading: false, error: null, success: null }
		;(useRouter as jest.Mock).mockReturnValue({ push: pushMock })
	})

	it('renders all form fields and buttons', () => {
		render(<Form />)
		expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
		expect(screen.getByTestId('turnstile')).toBeInTheDocument() // Captcha
		expect(
			screen.getByRole('button', { name: /^Entrar$/i })
		).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /Entrar com Google/i })
		).toBeInTheDocument()
	})

	it('calls signIn.social when clicking Google button', async () => {
		const user = userEvent.setup()
		render(<Form />)
		const googleButton = screen.getByRole('button', {
			name: /Entrar com Google/i,
		})
		await user.click(googleButton)
		expect(signIn.social).toHaveBeenCalledWith({ provider: 'google' })
	})

	it('submits form successfully and shows success toast', async () => {
		const user = userEvent.setup()
		;(signIn.email as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				await new Promise((resolve) => setTimeout(resolve, 0))
				callbacks.onSuccess({})
			}
		)

		render(<Form />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/Senha/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		await user.type(emailInput, 'user@test.com')
		await user.type(passwordInput, 'password123')

		await user.click(submitBtn)

		await waitFor(() => {
			expect(signIn.email).toHaveBeenCalledWith(
				{ email: 'user@test.com', password: 'password123' },
				expect.objectContaining({
					onRequest: expect.any(Function),
					onSuccess: expect.any(Function),
					onError: expect.any(Function),
				})
			)
		})
		await waitFor(() => {
			expect(mockSetSuccess).toHaveBeenCalledWith('LoggedIn successfully')
			expect(toast.success).toHaveBeenCalledWith('Login realizado com sucesso!')
			expect(pushMock).toHaveBeenCalledWith('/')
		})
	})

	it('handles submission error from API and shows error toast', async () => {
		const user = userEvent.setup()
		;(signIn.email as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				callbacks.onError({ error: { message: 'Invalid credentials' } })
			}
		)

		render(<Form />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/Senha/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		await user.type(emailInput, 'bad@test.com')
		await user.type(passwordInput, 'wrongpass')
		await user.click(submitBtn)

		await waitFor(() => {
			expect(mockSetError).toHaveBeenCalledWith('Invalid credentials')
			expect(toast.error).toHaveBeenCalledWith('Erro ao realizar login!')
		})
	})

	it('handles thrown error during submission and shows generic error toast', async () => {
		const user = userEvent.setup()
		;(signIn.email as jest.Mock).mockRejectedValue(new Error('Network Error'))

		render(<Form />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/Senha/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		await user.type(emailInput, 'error@test.com')
		await user.type(passwordInput, 'errorpass')
		await user.click(submitBtn)

		await waitFor(() => {
			expect(mockSetError).toHaveBeenCalledWith('Something get wrong')
			expect(toast.error).toHaveBeenCalledWith('Erro ao realizar login!')
		})
	})

	it('disables submit button during submission', async () => {
		const user = userEvent.setup()

		let signInEmailPromiseResolve: (value: unknown) => void
		;(signIn.email as jest.Mock).mockImplementation(
			async (creds, callbacks) => {
				// biome-ignore lint/complexity/useOptionalChain: <explanation>
				if (callbacks && callbacks.onRequest) {
					callbacks.onRequest()
				}
				return new Promise((resolve) => {
					signInEmailPromiseResolve = resolve
				})
			}
		)

		render(<Form />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/Senha/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		await user.type(emailInput, 'user@test.com')
		await user.type(passwordInput, 'password123')

		expect(submitBtn).toBeEnabled()

		await user.click(submitBtn)

		await waitFor(() => {
			expect(submitBtn).toBeDisabled()
		})

		expect(mockSetLoading).toHaveBeenCalledWith(true)
	})

	it('enables submit button initially', () => {
		render(<Form />)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })
		expect(submitBtn).toBeEnabled()
	})

	it('enables submit button when email is filled (if not submitting)', async () => {
		const user = userEvent.setup()
		render(<Form />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		await user.type(emailInput, 'test@example.com')
		expect(submitBtn).toBeEnabled()
	})

	it('enables submit button when password is filled (if not submitting)', async () => {
		const user = userEvent.setup()
		render(<Form />)
		const passwordInput = screen.getByLabelText(/Senha/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		await user.type(passwordInput, 'password123')
		expect(submitBtn).toBeEnabled()
	})

	it('submit button remains enabled when email is filled and then cleared (unless disabled logic changes)', async () => {
		const user = userEvent.setup()
		render(<Form />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/Senha/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		await user.type(emailInput, 'test@example.com')
		await user.click(passwordInput)
		await user.clear(emailInput)
		await user.click(passwordInput)

		expect(submitBtn).toBeEnabled()
	})

	it('submit button remains enabled when password is filled and then cleared (unless disabled logic changes)', async () => {
		const user = userEvent.setup()
		render(<Form />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/Senha/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		await user.type(passwordInput, 'password123')
		await user.click(emailInput)
		await user.clear(passwordInput)
		await user.click(emailInput)

		expect(submitBtn).toBeEnabled()
	})

	it('submit button enabled state reflects form validity (if disabled logic includes !isValid)', async () => {
		const user = userEvent.setup()
		render(<Form />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/Senha/i)
		const submitBtn = screen.getByRole('button', { name: /^Entrar$/i })

		expect(submitBtn).toBeEnabled()

		await user.type(emailInput, 'test@example.com')
		expect(submitBtn).toBeEnabled()

		await user.type(passwordInput, 'password123')
		expect(submitBtn).toBeEnabled()

		await user.clear(emailInput)
		expect(submitBtn).toBeEnabled()
	})
})
