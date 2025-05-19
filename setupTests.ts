import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure testing-library
configure({
	asyncUtilTimeout: 5000,
	getElementError: (message: string | null, container) => {
		const error = new Error(message || '')
		error.name = 'TestingLibraryElementError'
		error.stack = undefined
		return error
	},
})

// Suppress React 18 Strict Mode warnings
const originalError = console.error
beforeAll(() => {
	console.error = (...args) => {
		if (
			typeof args[0] === 'string' &&
			args[0].includes(
				'Warning: ReactDOM.render is no longer supported in React 18'
			)
		) {
			return
		}
		originalError.call(console, ...args)
	}
})

afterAll(() => {
	console.error = originalError
})
