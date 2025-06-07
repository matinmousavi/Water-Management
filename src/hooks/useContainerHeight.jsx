import { useState, useEffect, useRef } from 'react'

const useContainerHeight = (offset = 0) => {
	const containerRef = useRef(null)
	const [height, setHeight] = useState(0)

	useEffect(() => {
		const updateHeight = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect()
				const availableHeight = window.innerHeight - rect.top - offset
				setHeight(availableHeight > 0 ? availableHeight : 0)
			}
		}

		// First run
		updateHeight()

		// ResizeObserver for container itself
		const resizeObserver = new ResizeObserver(() => {
			updateHeight()
		})

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)
		}

		// Fallback to window resize
		window.addEventListener('resize', updateHeight)

		return () => {
			resizeObserver.disconnect()
			window.removeEventListener('resize', updateHeight)
		}
	}, [offset])

	return [containerRef, height]
}

export default useContainerHeight
