'use client'

import Image from 'next/image'
import { useState } from 'react'

export function AuthHero() {
	const [imageError, setImageError] = useState(false)

	function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
		console.log('image error', e)
		setImageError(true)
	}

	return (
		<div className="flex items-center gap-2 mb-8">
			{!imageError ? (
				<Image
					src="/main_logo.svg"
					alt="PoliEats main logo"
					height={40}
					width={40}
					unoptimized
					priority
					onError={(e) => handleImageError(e)}
				/>
			) : (
				<div className="w-10 h-10 bg-gradient-to-r from-gradient-from to-gradient-to rounded-lg flex items-center justify-center text-white font-bold text-sm">
					PE
				</div>
			)}
			<h1 className="text-2xl bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text font-normal">
				polieats
			</h1>
		</div>
	)
}
