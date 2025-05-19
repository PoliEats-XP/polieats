import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '@/components/auth/register-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/hooks/useAuthState'
import { signUp, signIn } from '@/lib/auth-client'
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

jest.mock('next-themes', () => ({
	useTheme: jest.fn(() => ({ theme: 'light' })),
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
	signUp: {
		email: jest.fn(),
	},
	signIn: {
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

describe('Register Form', () => {
	const pushMock = jest.fn()
	const user = userEvent.setup({ delay: null })

	beforeEach(() => {
		jest.clearAllMocks()
		mockAuthInternalState = { loading: false, error: null, success: null }
		;(useRouter as jest.Mock).mockReturnValue({ push: pushMock })
		jest.useRealTimers()
	})

	it('renders all form fields and buttons', () => {
		render(<RegisterForm />)
		expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/Confirmar senha/i)).toBeInTheDocument()
		expect(screen.getByTestId('turnstile')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /^Entrar$/i })
		).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /Entrar com Google/i })
		).toBeInTheDocument()
		expect(screen.getByText(/Já tem uma conta?/i)).toBeInTheDocument()
	})

	it('calls signIn.social when clicking Google button', async () => {
		render(<RegisterForm />)
		const googleButton = screen.getByRole('button', {
			name: /Entrar com Google/i,
		})
		await act(async () => {
			await user.click(googleButton)
		})
		expect(signIn.social).toHaveBeenCalledWith({ provider: 'google' })
	})

	it('check if its possible to register a user using valid credentials', async () => {
		jest.useFakeTimers()
		;(signUp.email as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				await new Promise((resolve) => setTimeout(resolve, 0))
				callbacks.onSuccess({})
				callbacks.onResponse()
			}
		)

		render(<RegisterForm />)
		const nameInput = screen.getByLabelText(/Nome/i)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/^Senha$/i)
		const confirmPasswordInput = screen.getByLabelText(/Confirmar senha/i)
		const submitButton = screen.getByRole('button', { name: /^Entrar$/i })

		await act(async () => {
			await user.type(nameInput, 'Test User')
			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')
			await user.type(confirmPasswordInput, 'password123')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(signUp.email).toHaveBeenCalledWith(
				{
					name: 'Test User',
					email: 'test@example.com',
					password: 'password123',
				},
				expect.objectContaining({
					onRequest: expect.any(Function),
					onSuccess: expect.any(Function),
					onError: expect.any(Function),
					onResponse: expect.any(Function),
				})
			)
		})

		await waitFor(() => {
			expect(mockSetSuccess).toHaveBeenCalledWith('SignUp successful')
			expect(toast.success).toHaveBeenCalledWith(
				'Conta criada com sucesso! Redirecionando para o login...'
			)
		})

		jest.advanceTimersByTime(3000)

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith('/login')
		})

		jest.useRealTimers()
	})

	it('check if system blocks registering users with already existing e-mail', async () => {
		;(signUp.email as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				await new Promise((resolve) => setTimeout(resolve, 0))
				callbacks.onError({ error: { message: 'Email already exists' } })
				callbacks.onResponse()
			}
		)

		render(<RegisterForm />)
		const nameInput = screen.getByLabelText(/Nome/i)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/^Senha$/i)
		const confirmPasswordInput = screen.getByLabelText(/Confirmar senha/i)
		const submitButton = screen.getByRole('button', { name: /^Entrar$/i })

		await act(async () => {
			await user.type(nameInput, 'Another User')
			await user.type(emailInput, 'existing@example.com')
			await user.type(passwordInput, 'password123')
			await user.type(confirmPasswordInput, 'password123')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(signUp.email).toHaveBeenCalledWith(
				{
					name: 'Another User',
					email: 'existing@example.com',
					password: 'password123',
				},
				expect.anything()
			)
		})

		await waitFor(() => {
			expect(mockSetError).toHaveBeenCalledWith('Email already exists')
			expect(toast.error).toHaveBeenCalledWith('Erro ao realizar cadastro!')
		})
	})

	it('check if the mandatory fields are correctly filled (name, email, password, confirm password', async () => {
		render(<RegisterForm />)
		const submitButton = screen.getByRole('button', { name: /^Entrar$/i })

		await act(async () => {
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(
				screen.getByText(/^Nome deve ter pelo menos 3 caracteres$/i)
			).toBeInTheDocument()
			expect(screen.getByText(/E-mail é obrigatório/i)).toBeInTheDocument()
			expect(
				screen.getAllByText(/^Senha deve ter pelo menos 6 caracteres.$/i).length
			).toBeGreaterThan(0)
		})

		const nameInput = screen.getByLabelText(/Nome/i)
		await act(async () => {
			await user.type(nameInput, 'Test')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(screen.queryByText(/Nome é obrigatório/i)).not.toBeInTheDocument()
			expect(screen.getByText(/E-mail é obrigatório/i)).toBeInTheDocument()
		})

		const emailInput = screen.getByLabelText(/E-mail/i)
		await act(async () => {
			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(
				screen.queryByText(/E-mail é obrigatório/i)
			).not.toBeInTheDocument()
			expect(
				screen.getAllByText(/^Senha deve ter pelo menos 6 caracteres.$/i).length
			).toBeGreaterThan(0)
		})

		const passwordInput = screen.getByLabelText(/^Senha$/i)
		await act(async () => {
			await user.type(passwordInput, 'short')
			await user.click(submitButton)
		})
		await waitFor(() => {
			expect(screen.getAllByText(/^Senha deve ter pelo menos 6 caracteres.$/i))
		})
		await act(async () => {
			await user.clear(passwordInput)
			await user.type(passwordInput, 'longenough')
		})

		const confirmPasswordInput = screen.getByLabelText(/Confirmar senha/i)
		await act(async () => {
			await user.type(confirmPasswordInput, 'mismatch')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(
				screen.queryByText(/^Senha deve ter pelo menos 6 caracteres.$/i)
			).not.toBeInTheDocument()
		})
	})

	it('shows error message when passwords does not match on submit', async () => {
		render(<RegisterForm />)
		const nameInput = screen.getByLabelText(/Nome/i)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/^Senha$/i)
		const confirmPasswordInput = screen.getByLabelText(/Confirmar senha/i)
		const submitButton = screen.getByRole('button', { name: /^Entrar$/i })

		await act(async () => {
			await user.type(nameInput, 'Test User')
			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')
			await user.type(confirmPasswordInput, 'password456')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument()
			expect(toast.error).toHaveBeenCalledWith('As senhas não coincidem')
			expect(signUp.email).not.toHaveBeenCalled()
		})
	})

	it('disables submit button during submission', async () => {
		let signUpEmailPromiseResolve: ((value?: unknown) => void) | undefined =
			undefined
		;(signUp.email as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				return new Promise((resolve) => {
					signUpEmailPromiseResolve = resolve
				})
			}
		)

		render(<RegisterForm />)
		const nameInput = screen.getByLabelText(/Nome/i)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/^Senha$/i)
		const confirmPasswordInput = screen.getByLabelText(/Confirmar senha/i)
		const submitButton = screen.getByRole('button', { name: /^Entrar$/i })

		await act(async () => {
			await user.type(nameInput, 'Test User')
			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')
			await user.type(confirmPasswordInput, 'password123')
		})

		expect(submitButton).toBeEnabled()

		await act(async () => {
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(submitButton).toBeDisabled()
		})
		expect(mockSetLoading).toHaveBeenCalledWith(true)

		if (signUpEmailPromiseResolve) {
			await act(async () => {
				// @ts-ignore
				signUpEmailPromiseResolve()
			})
		}
	})

	it('handles generic error during submission and shows generic error toast', async () => {
		;(signUp.email as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				throw new Error('Network Error')
			}
		)

		render(<RegisterForm />)
		const nameInput = screen.getByLabelText(/Nome/i)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const passwordInput = screen.getByLabelText(/^Senha$/i)
		const confirmPasswordInput = screen.getByLabelText(/Confirmar senha/i)
		const submitButton = screen.getByRole('button', { name: /^Entrar$/i })

		await act(async () => {
			await user.type(nameInput, 'Error User')
			await user.type(emailInput, 'error@example.com')
			await user.type(passwordInput, 'errorPass')
			await user.type(confirmPasswordInput, 'errorPass')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(mockSetError).toHaveBeenCalledWith('Something get wrong')
			expect(toast.error).toHaveBeenCalledWith('Erro ao realizar cadastro!')
			expect(mockSetLoading).toHaveBeenCalledWith(false)
		})
	})
})
