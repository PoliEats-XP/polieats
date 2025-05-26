import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Generates a user-friendly order number from UUID
 * Format: XXXXX (max 5 digits from UUID hash)
 */
export function generateOrderNumber(id: string): string {
	// Remove hyphens and create a simple hash from UUID
	const cleanId = id.replace(/-/g, '')

	// Create a simple hash by summing character codes
	let hash = 0
	for (let i = 0; i < cleanId.length; i++) {
		const char = cleanId.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32-bit integer
	}

	// Convert to positive number and limit to 5 digits
	const positiveHash = Math.abs(hash)
	const shortId = (positiveHash % 99999) + 1 // Ensures 1-99999 range

	return shortId.toString().padStart(5, '0')
}

/**
 * Formats date and time for display in user's timezone
 * @param dateString - Date string in DD/MM/YYYY HH:mm format or DD/MM/YYYY format
 * @returns Formatted date and time string
 */
export function formatOrderDateTime(dateString: string): string {
	// Check if the string already contains time (DD/MM/YYYY HH:mm format)
	if (dateString.includes(' ')) {
		// Already formatted with time, just return it with "às" separator
		const [datePart, timePart] = dateString.split(' ')
		return `${datePart} às ${timePart}`
	}

	// Parse DD/MM/YYYY format (legacy format without time)
	const dateParts = dateString.split('/')
	if (dateParts.length === 3) {
		const [day, month, year] = dateParts
		// Create date object (month is 0-indexed in JS) - defaults to midnight
		const date = new Date(
			Number.parseInt(year),
			Number.parseInt(month) - 1,
			Number.parseInt(day)
		)

		// Format date in user's locale
		const dateFormatted = date.toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})

		// Since we don't have time info, just show the date
		return dateFormatted
	}

	// Fallback to original string if parsing fails
	return dateString
}
