import { useEffect, useRef, useState } from 'react'

import styles from './TimerDisplay.module.css'

const TWO_HOURS = 2 * 60 * 60

const formatTime = seconds => {
	const hrs = Math.floor(seconds / 3600)
	const mins = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60
	return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
}

const TimerDisplay = ({ startedAt }) => {
	const [time, setTime] = useState('00 : 00 : 00')
	const [isOvertime, setIsOvertime] = useState(false)
	const intervalRef = useRef(null)

	useEffect(() => {
		if (!startedAt) return

		const startTime = typeof startedAt === 'number' ? startedAt : new Date(startedAt).getTime()

		const update = () => {
			const elapsed = Math.floor((Date.now() - startTime) / 1000)

			if (elapsed < TWO_HOURS) {
				const remaining = TWO_HOURS - elapsed
				setTime(formatTime(remaining))
				setIsOvertime(false)
			} else {
				const over = elapsed - TWO_HOURS
				setTime(formatTime(over))
				setIsOvertime(true)
			}
		}

		update()
		clearInterval(intervalRef.current)
		intervalRef.current = setInterval(update, 1000)

		return () => clearInterval(intervalRef.current)
	}, [startedAt])

	return <span className={isOvertime ? styles.textRed : styles.textGreen}>{time}</span>
}

export default TimerDisplay
