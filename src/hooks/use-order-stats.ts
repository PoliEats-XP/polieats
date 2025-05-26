import { useQueryClient } from '@tanstack/react-query'

interface OrderStats {
	total: number
	pending: number
	completed: number
	canceled: number
	totalRevenue: number
	averageOrderValue: number
}

export function useOrderStats() {
	const queryClient = useQueryClient()

	const updateStatsOptimistically = (
		oldStatus: string,
		newStatus: string,
		orderValue: number
	) => {
		queryClient.setQueryData(
			['admin-order-stats'],
			(oldStats: OrderStats | undefined) => {
				if (!oldStats) return oldStats

				const newStats = { ...oldStats }

				// Remove from old status
				switch (oldStatus) {
					case 'PENDING':
						newStats.pending = Math.max(0, newStats.pending - 1)
						break
					case 'COMPLETED':
						newStats.completed = Math.max(0, newStats.completed - 1)
						newStats.totalRevenue = Math.max(
							0,
							newStats.totalRevenue - orderValue
						)
						break
					case 'CANCELED':
					case 'CANCELLED': // Handle both spellings
						newStats.canceled = Math.max(0, newStats.canceled - 1)
						break
				}

				// Add to new status
				switch (newStatus) {
					case 'PENDING':
						newStats.pending += 1
						break
					case 'COMPLETED':
						newStats.completed += 1
						newStats.totalRevenue += orderValue
						break
					case 'CANCELED':
					case 'CANCELLED': // Handle both spellings
						newStats.canceled += 1
						break
				}

				// Recalculate average order value
				if (newStats.completed > 0) {
					newStats.averageOrderValue =
						newStats.totalRevenue / newStats.completed
				} else {
					newStats.averageOrderValue = 0
				}

				return newStats
			}
		)
	}

	const invalidateStats = () => {
		queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] })
	}

	return {
		updateStatsOptimistically,
		invalidateStats,
	}
}
