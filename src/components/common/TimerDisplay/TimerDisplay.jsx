import { useEffect, useRef, useState } from 'react'
import styles from './TimerDisplay.module.css'

const formatTime = seconds => {
	const abs = Math.abs(seconds)
	const hrs = Math.floor(abs / 3600)
	const mins = Math.floor((abs % 3600) / 60)
	const secs = abs % 60
	return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
}

const TimerDisplay = ({ startedAt, requiredWaterMs, remainingWaterMs, onComplete }) => {
	const [text, setText] = useState('00 : 00 : 00')
	const [isOvertime, setIsOvertime] = useState(false)
	const intervalRef = useRef(null)

	useEffect(() => {
		if (!startedAt || !requiredWaterMs) return

		const tick = () => {
			const now = Date.now()
			const elapsed = Math.floor((now - new Date(startedAt).getTime()) / 1000)
			const remaining = remainingWaterMs != null ? remainingWaterMs : requiredWaterMs
			let remainingSec = Math.floor(remaining / 1000) - elapsed

			if (remainingSec < 0) {
				setIsOvertime(true)
				setText(`${formatTime(-remainingSec)} -`)
			} else {
				setIsOvertime(false)
				setText(formatTime(remainingSec))
			}

			if (remainingSec <= -1 && onComplete) {
				onComplete()
				clearInterval(intervalRef.current)
			}
		}

		tick()
		clearInterval(intervalRef.current)
		intervalRef.current = setInterval(tick, 1000)

		return () => clearInterval(intervalRef.current)
	}, [startedAt, requiredWaterMs, remainingWaterMs, onComplete])

	return <span className={isOvertime ? styles.textRed : styles.textGreen}>{text}</span>
}

export default TimerDisplay
