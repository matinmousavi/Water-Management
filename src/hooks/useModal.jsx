import { useState, useRef, useCallback } from 'react'

const useModal = () => {
	const [isOpen, setIsOpen] = useState(false)

	const beforeOpenRef = useRef(null)
	const afterOpenRef = useRef(null)
	const beforeCloseRef = useRef(null)
	const afterCloseRef = useRef(null)

	const open = useCallback((callback, timing = 'before') => {
		if (timing === 'before') {
			beforeOpenRef.current = callback
			if (typeof beforeOpenRef.current === 'function') {
				beforeOpenRef.current()
			}
			beforeOpenRef.current = null
		} else if (timing === 'after') {
			afterOpenRef.current = callback
		}
		setIsOpen(true)
	}, [])

	const close = useCallback((callback, timing = 'before') => {
		if (timing === 'before') {
			beforeCloseRef.current = callback
			if (typeof beforeCloseRef.current === 'function') {
				beforeCloseRef.current()
			}
			beforeCloseRef.current = null
		} else if (timing === 'after') {
			afterCloseRef.current = callback
		}
		setIsOpen(false)
	}, [])

	const handleAfterChange = useCallback(openState => {
		if (openState) {
			if (typeof afterOpenRef.current === 'function') {
				afterOpenRef.current()
			}
			afterOpenRef.current = null
		} else {
			if (typeof afterCloseRef.current === 'function') {
				afterCloseRef.current()
			}
			afterCloseRef.current = null
		}
	}, [])

	const toggle = useCallback(() => {
		setIsOpen(prev => !prev)
	}, [])

	return {
		isOpen,
		open,
		close,
		toggle,
		handleAfterChange,
	}
}

export default useModal
