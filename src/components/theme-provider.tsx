'use client'

import { useIsMounted } from '@/hooks/useIsMounted'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect, type ComponentProps } from 'react'

export function ThemeProvider({
	children,
	...props
}: ComponentProps<typeof NextThemesProvider>) {
	const isMounted = useIsMounted()

	useEffect(() => {
		isMounted()
	}, [isMounted])

	return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
