'use client'

import { useCallback, useRef } from 'react'

export function useInfiniteScroll(
	callback: () => void,
	hasMore: boolean
): [React.RefCallback<HTMLDivElement>] {
	const observer = useRef<IntersectionObserver | null>(null)

	const lastElementRef = useCallback(
		(node: HTMLDivElement) => {
			if (observer.current) observer.current.disconnect()

			observer.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting && hasMore) {
						callback()
					}
				},
				{
					threshold: 1.0,
				}
			)

			if (node) observer.current.observe(node)
		},
		[callback, hasMore]
	)

	return [lastElementRef]
}
