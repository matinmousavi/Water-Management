import { useEffect, useRef, useState } from 'react'
import styles from './TimerDisplay.module.css'

const formatTime = seconds => {
	const hrs = Math.floor(seconds / 3600)
	const mins = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60
	return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
}

const TimerDisplay = ({ startedAt, endedAt }) => {
	const [time, setTime] = useState('00 : 00 : 00')
	const [isOvertime, setIsOvertime] = useState(false)
	const intervalRef = useRef(null)

	useEffect(() => {
		if (!startedAt) return

		const startTime = typeof startedAt === 'number' ? startedAt : new Date(startedAt).getTime()
		const endTime = endedAt ? (typeof endedAt === 'number' ? endedAt : new Date(endedAt).getTime()) : null

		const update = () => {
			const now = Date.now()

			if (endTime) {
				// حالتی که پایان مشخص شده
				if (now < startTime) {
					setTime('00 : 00 : 00')
					setIsOvertime(false)
				} else if (now >= startTime && now <= endTime) {
					const remaining = Math.floor((endTime - now) / 1000)
					setTime(formatTime(remaining))
					setIsOvertime(false)
				} else {
					const overtime = Math.floor((now - endTime) / 1000)
					setTime(`${formatTime(overtime)} -`)
					setIsOvertime(true)
				}
			} else {
				// حالتی که پایان مشخص نشده (ongoing irrigation)
				if (now < startTime) {
					setTime('00 : 00 : 00')
				} else {
					const elapsed = Math.floor((now - startTime) / 1000)
					setTime(formatTime(elapsed))
				}
				setIsOvertime(false)
			}
		}

		update()
		clearInterval(intervalRef.current)
		intervalRef.current = setInterval(update, 1000)

		return () => clearInterval(intervalRef.current)
	}, [startedAt, endedAt])

	return <span className={isOvertime ? styles.textRed : styles.textGreen}>{time}</span>
}

export default TimerDisplay
