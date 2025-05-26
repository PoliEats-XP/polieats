import { EmailVerificationBanner } from '@/components/email-verification-banner'
import { ProfileDialog } from '@/components/profile-dialog'
import { Chatbot } from '@/components/chatbot'
import { RecentOrders } from '@/components/recent-orders'
import { DynamicNavbar } from '@/components/dynamic-navbar'

export const metadata = {
	title: 'PoliEats - Home',
	description: 'Home page for PoliEats',
}

export default function Home() {
	return (
		<>
			<EmailVerificationBanner />
			<DynamicNavbar />

			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-6 py-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)] max-w-7xl mx-auto">
						{/* Chatbot Section - Now on the left */}
						<div className="h-full min-h-[600px]">
							<Chatbot />
						</div>

						{/* Recent Orders Section - Now on the right */}
						<div className="h-full min-h-[600px]">
							<RecentOrders />
						</div>
					</div>
				</div>
			</div>

			<ProfileDialog />
		</>
	)
}
