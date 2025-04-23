import type { Metadata } from 'next'
import { Ubuntu } from 'next/font/google'
import './globals.css'

const ubuntu = Ubuntu({
	weight: ['300', '400', '500'],
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'PoliEats',
	description: 'A food ordering app for students',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${ubuntu.className} antialiased`}>{children}</body>
		</html>
	)
}
