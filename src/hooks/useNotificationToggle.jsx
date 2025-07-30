import { useState, useCallback } from 'react'
import useAPI from './useAPI'

// This is a debounc hook

export default function useNotificationToggle({ landId, initialValue }) {
	const [enabled, setEnabled] = useState(initialValue)
	const [loading, setLoading] = useState(false)
	const api = useAPI()

	const toggle = useCallback(async () => {
		const next = !enabled
		setEnabled(next)
		setLoading(true)

		try {
			const response = await api.patch(`lands/${landId}`, {
				notificationsEnabled: next,
			})
			setEnabled(response?.land?.notificationsEnabled ?? next)
		} catch (err) {
			setEnabled(!next)
		} finally {
			setLoading(false)
		}
	}, [enabled, landId])

	return { enabled, loading, toggle }
}
