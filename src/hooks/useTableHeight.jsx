import { useState, useEffect } from 'react'

const useTableHeight = ({ offset = 130, headerHeight = 50, paginationHeight = 51, rowHeight = 51, minHeight = 200 } = {}) => {
	const [tableHeight, setTableHeight] = useState(0)
	const [pageSize, setPageSize] = useState(0)

	const calculateHeights = () => {
		const screenHeight = window.innerHeight
		const maxHeight = Math.max(screenHeight - offset, minHeight)
		const availableHeight = maxHeight - headerHeight - paginationHeight
		const calculatedPageSize = Math.floor(availableHeight / rowHeight)

		setTableHeight(maxHeight)
		setPageSize(calculatedPageSize)
	}

	useEffect(() => {
		calculateHeights()
		window.addEventListener('resize', calculateHeights)
		return () => {
			window.removeEventListener('resize', calculateHeights)
		}
	}, [])

	return { tableHeight, pageSize }
}

export default useTableHeight
