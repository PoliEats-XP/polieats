import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForgetPasswordForm } from '@/components/auth/forget-password-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/hooks/useAuthState'
import { authClient } from '@/lib/auth-client'
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
	authClient: {
		forgetPassword: jest.fn(),
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

describe('Forget Password Form', () => {
	const pushMock = jest.fn()
	const user = userEvent.setup({ delay: null })

	beforeEach(() => {
		jest.clearAllMocks()
		mockAuthInternalState = { loading: false, error: null, success: null }
		;(useRouter as jest.Mock).mockReturnValue({ push: pushMock })
	})

	it('renders all form fields and buttons', () => {
		render(<ForgetPasswordForm />)
		expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument()
		expect(screen.getByTestId('turnstile')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /Enviar e-mail/i })
		).toBeInTheDocument()
		expect(screen.getByText(/Lembrou sua senha?/i)).toBeInTheDocument()
	})

	it('submits form successfully and shows success toast', async () => {
		;(authClient.forgetPassword as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				await new Promise((resolve) => setTimeout(resolve, 0))
				callbacks.onSuccess({})
				callbacks.onResponse()
			}
		)

		render(<ForgetPasswordForm />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const submitButton = screen.getByRole('button', { name: /Enviar e-mail/i })

		await act(async () => {
			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(authClient.forgetPassword).toHaveBeenCalledWith(
				{
					email: 'test@example.com',
					redirectTo: '/reset-password',
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
			expect(mockSetSuccess).toHaveBeenCalledWith('LoggedIn successfully')
			expect(toast.success).toHaveBeenCalledWith(
				'E-mail de redefinição de senha enviado com sucesso!'
			)
		})
	})

	it('handles submission error from API and shows error toast', async () => {
		;(authClient.forgetPassword as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				callbacks.onError({ error: { message: 'Email not found' } })
				callbacks.onResponse()
			}
		)

		render(<ForgetPasswordForm />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const submitButton = screen.getByRole('button', { name: /Enviar e-mail/i })

		await act(async () => {
			await user.type(emailInput, 'nonexistent@example.com')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(mockSetError).toHaveBeenCalledWith('Email not found')
			expect(toast.error).toHaveBeenCalledWith(
				'Erro ao enviar e-mail de redefinição!'
			)
		})
	})

	it('handles generic error during submission and shows generic error toast', async () => {
		;(authClient.forgetPassword as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				throw new Error('Network Error')
			}
		)

		render(<ForgetPasswordForm />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const submitButton = screen.getByRole('button', { name: /Enviar e-mail/i })

		await act(async () => {
			await user.type(emailInput, 'error@example.com')
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(mockSetError).toHaveBeenCalledWith('Something get wrong')
			expect(toast.error).toHaveBeenCalledWith(
				'Erro ao enviar e-mail de redefinição!'
			)
			expect(mockSetLoading).toHaveBeenCalledWith(false)
		})
	})

	it('disables submit button during submission', async () => {
		let forgetPasswordPromiseResolve: ((value?: unknown) => void) | undefined =
			undefined
		;(authClient.forgetPassword as jest.Mock).mockImplementation(
			async (_creds, callbacks) => {
				callbacks.onRequest()
				return new Promise((resolve) => {
					forgetPasswordPromiseResolve = resolve
				})
			}
		)

		render(<ForgetPasswordForm />)
		const emailInput = screen.getByLabelText(/E-mail/i)
		const submitButton = screen.getByRole('button', { name: /Enviar e-mail/i })

		await act(async () => {
			await user.type(emailInput, 'test@example.com')
		})
		expect(submitButton).toBeEnabled()

		await act(async () => {
			await user.click(submitButton)
		})

		await waitFor(() => {
			expect(submitButton).toBeDisabled()
		})
		expect(mockSetLoading).toHaveBeenCalledWith(true)

		if (forgetPasswordPromiseResolve) {
			await act(async () => {
				// @ts-ignore
				forgetPasswordPromiseResolve()
			})
		}
	})
})
