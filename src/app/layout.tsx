import type { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Ubuntu } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ClientToaster } from '@/components/client-toaster'
import { ClientQueryProvider } from '@/components/query-client-provider'
import CookieConsent from '@/components/ui/cookie-consent'

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
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${ubuntu.className} antialiased`}
				suppressHydrationWarning
			>
				<ClientQueryProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						disableTransitionOnChange
					>
						<NuqsAdapter>{children}</NuqsAdapter>
						<ClientToaster />
						<CookieConsent />
					</ThemeProvider>
				</ClientQueryProvider>
			</body>
		</html>
	)
}
