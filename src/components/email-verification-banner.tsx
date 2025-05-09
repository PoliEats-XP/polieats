import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmailVerificationBannerProps {
	onResendEmail?: () => void
}

export function EmailVerificationBanner({
	onResendEmail,
}: EmailVerificationBannerProps) {
	return (
		<div
			role="alert"
			className="bg-yellow-100 text-yellow-800 p-4 flex items-center justify-between"
		>
			<div className="flex items-center">
				<AlertTriangle className="h-5 w-5 mr-2" />
				<p className="font-medium">Seu e-mail ainda não está verificado.</p>
			</div>
			<Button variant="outline" onClick={onResendEmail}>
				Enviar e-mail de verificação
			</Button>
		</div>
	)
}
