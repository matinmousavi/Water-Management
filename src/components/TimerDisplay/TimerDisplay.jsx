import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import styles from './TimerDisplay.module.css'

// ss : mm : hh
const formatTime = seconds => {
	const abs = Math.abs(seconds)
	const hrs = Math.floor(abs / 3600)
	const mins = Math.floor((abs % 3600) / 60)
	const secs = abs % 60
	return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
}

const TimerDisplay = ({ startedAt, durationMs }) => {
	const [text, setText] = useState('00 : 00 : 00')
	const [isOvertime, setIsOvertime] = useState(false)
	const intervalRef = useRef(null)

	useEffect(() => {
		if (!startedAt || !durationMs) return

		const startMs = typeof startedAt === 'number' ? startedAt : dayjs(startedAt).isValid() ? dayjs(startedAt).valueOf() : Number(startedAt)

		if (!startMs || Number.isNaN(startMs)) return

		const endMs = startMs + durationMs

		const tick = () => {
			const now = Date.now()
			const remainingSec = Math.floor((endMs - now) / 1000)

			if (remainingSec >= 0) {
				setText(formatTime(remainingSec))
				setIsOvertime(false)
			} else {
				setText(`${formatTime(remainingSec)} -`)
				setIsOvertime(true)
			}
		}

		tick()
		clearInterval(intervalRef.current)
		intervalRef.current = setInterval(tick, 1000)
		return () => clearInterval(intervalRef.current)
	}, [startedAt, durationMs])

	if (!durationMs) return null

	return <span className={isOvertime ? styles.textRed : styles.textGreen}>{text}</span>
}

export default TimerDisplay
