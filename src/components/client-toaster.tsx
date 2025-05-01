'use client'

import { Toaster } from 'sonner'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ClientToaster() {
	const { theme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	return <Toaster theme={theme === 'dark' ? 'dark' : 'light'} />
}
