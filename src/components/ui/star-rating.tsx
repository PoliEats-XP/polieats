'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
	rating: number
	onRatingChange?: (rating: number) => void
	readonly?: boolean
	size?: 'sm' | 'md' | 'lg'
	className?: string
	showLabel?: boolean
}

export function StarRating({
	rating,
	onRatingChange,
	readonly = false,
	size = 'md',
	className,
	showLabel = false,
}: StarRatingProps) {
	const [hoverRating, setHoverRating] = useState(0)

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6',
	}

	const handleClick = (value: number) => {
		if (!readonly && onRatingChange) {
			onRatingChange(value)
		}
	}

	const handleMouseEnter = (value: number) => {
		if (!readonly) {
			setHoverRating(value)
		}
	}

	const handleMouseLeave = () => {
		if (!readonly) {
			setHoverRating(0)
		}
	}

	const getRatingLabel = (rating: number) => {
		if (rating === 0) return 'Sem avaliação'
		if (rating === 1) return 'Muito ruim'
		if (rating === 2) return 'Ruim'
		if (rating === 3) return 'Regular'
		if (rating === 4) return 'Bom'
		if (rating === 5) return 'Excelente'
		return ''
	}

	return (
		<div className={cn('flex items-center gap-1', className)}>
			<div className="flex items-center gap-0.5">
				{[1, 2, 3, 4, 5].map((star) => {
					const isActive = star <= (hoverRating || rating)
					return (
						<button
							key={star}
							type="button"
							className={cn(
								'transition-colors duration-150 flex items-center justify-center',
								readonly
									? 'cursor-default'
									: 'cursor-pointer hover:brightness-110'
							)}
							onClick={() => handleClick(star)}
							onMouseEnter={() => handleMouseEnter(star)}
							onMouseLeave={handleMouseLeave}
							disabled={readonly}
						>
							<Star
								className={cn(
									sizeClasses[size],
									'transition-colors duration-150',
									isActive
										? 'fill-yellow-400 text-yellow-400'
										: 'fill-gray-200 text-gray-200'
								)}
							/>
						</button>
					)
				})}
			</div>
			{showLabel && (
				<span className="text-sm text-muted-foreground ml-2 min-w-[80px] inline-block">
					{getRatingLabel(hoverRating || rating)}
				</span>
			)}
		</div>
	)
}
