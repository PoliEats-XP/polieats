'use client'

import { useIsMounted } from '@/hooks'
import { useEffect, type ReactNode } from 'react'

interface LayoutProps {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
	const isMounted = useIsMounted()

	useEffect(() => {
		isMounted()
	}, [isMounted])

	return (
		<>
			<main>{children}</main>
		</>
	)
}
