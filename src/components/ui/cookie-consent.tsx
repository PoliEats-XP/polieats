'use client'

import { CookieIcon } from 'lucide-react'
import { Button } from './button'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CookieConsentProps {
	variant?: 'default' | 'small'
	demo?: boolean
	onAcceptCallback?: () => void
	onDeclineCallback?: () => void
}

export default function CookieConsent({
	variant = 'default',
	demo = false,
	onAcceptCallback = () => {},
	onDeclineCallback = () => {},
}: CookieConsentProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [hide, setHide] = useState(false)

	const accept = () => {
		setIsOpen(false)
		document.cookie =
			'cookieConsent=true; expires=Fri, 31 Dec 9999 23:59:59 GMT'
		setTimeout(() => {
			setHide(true)
		}, 700)
		onAcceptCallback()
	}

	const decline = () => {
		setIsOpen(false)
		setTimeout(() => {
			setHide(true)
		}, 700)
		onDeclineCallback()
	}

	useEffect(() => {
		try {
			setIsOpen(true)
			if (document.cookie.includes('cookieConsent=true')) {
				if (!demo) {
					setIsOpen(false)
					setTimeout(() => {
						setHide(true)
					}, 700)
				}
			}
		} catch (e) {
			// console.log("Error: ", e);
		}
	}, [])

	return variant !== 'small' ? (
		<div
			className={cn(
				'fixed z-[200] bottom-0 left-0 right-0 sm:left-4 sm:bottom-4 w-full sm:max-w-md duration-700',
				!isOpen
					? 'transition-[opacity,transform] translate-y-8 opacity-0'
					: 'transition-[opacity,transform] translate-y-0 opacity-100',
				hide && 'hidden'
			)}
		>
			<div className="dark:bg-card bg-background rounded-md m-3 border border-border shadow-lg">
				<div className="grid gap-2">
					<div className="border-b border-border h-14 flex items-center justify-between p-4">
						<h1 className="text-lg font-medium">We use cookies</h1>
						<CookieIcon className="h-[1.2rem] w-[1.2rem]" />
					</div>
					<div className="p-4">
						<p className="text-sm font-normal text-start">
							Usamos cookies para garantir que você tenha a melhor experiência
							em nosso site. Para mais informações sobre como usamos cookies,
							consulte nossa política de cookies.
							<br />
							<br />
							<span className="text-xs">
								Ao clicar em "
								<span className="font-medium opacity-80">Aceitar</span>
								", você concorda com o uso de cookies.
							</span>
							<br />
							<a href="#" className="text-xs underline">
								Saber mais.
							</a>
						</p>
					</div>
					<div className="flex flex-col gap-2 p-4 py-5 border-t border-border dark:bg-background/20">
						<Button
							onClick={accept}
							className="w-full bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80%"
						>
							Aceitar
						</Button>
						<Button onClick={decline} className="w-full" variant="secondary">
							Negar
						</Button>
					</div>
				</div>
			</div>
		</div>
	) : (
		<div
			className={cn(
				'fixed z-[200] bottom-0 left-0 right-0 sm:left-4 sm:bottom-4 w-full sm:max-w-md duration-700',
				!isOpen
					? 'transition-[opacity,transform] translate-y-8 opacity-0'
					: 'transition-[opacity,transform] translate-y-0 opacity-100',
				hide && 'hidden'
			)}
		>
			<div className="m-3 dark:bg-card bg-background border border-border rounded-lg">
				<div className="flex items-center justify-between p-3">
					<h1 className="text-lg font-medium">Nós usamos cookies</h1>
					<CookieIcon className="h-[1.2rem] w-[1.2rem]" />
				</div>
				<div className="p-3 -mt-2">
					<p className="text-sm text-left text-muted-foreground">
						Usamos cookies para garantir que você tenha a melhor experiência em
						nosso site. Para mais informações sobre como usamos cookies,
						consulte nossa política de cookies.
					</p>
				</div>
				<div className="p-3 flex flex-col items-center gap-2 mt-2 border-t">
					<Button
						onClick={accept}
						className="w-full h-9 rounded-full bg-gradient-to-r from-[#ED2152] from-0% to-[#C71585] to-80%"
					>
						aceitar
					</Button>
					<Button
						onClick={decline}
						className="w-full h-9 rounded-full"
						variant="outline"
					>
						negar
					</Button>
				</div>
			</div>
		</div>
	)
}
