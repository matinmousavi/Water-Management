import { useEffect, useRef, useState } from 'react'
import styles from './TimerDisplay.module.css'
import { getIrrigationStartTime, setIrrigationStartTime, removeIrrigationStartTime } from '../../utils/irrigationStorage' // مسیر فایل helper رو درست وارد کن

// ss : mm : hh
const formatTime = seconds => {
	const abs = Math.abs(seconds)
	const hrs = Math.floor(abs / 3600)
	const mins = Math.floor((abs % 3600) / 60)
	const secs = abs % 60
	return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
}

const TimerDisplay = ({ landId, startedAt, requiredWaterMs, remainingWaterMs, onComplete }) => {
	const [text, setText] = useState('00 : 00 : 00')
	const [isOvertime, setIsOvertime] = useState(false)
	const intervalRef = useRef(null)

	// زمان شروع را از localStorage بازیابی می‌کنیم اگر موجود باشد
	useEffect(() => {
		if (!landId || !requiredWaterMs) return

		let startMs = startedAt ? new Date(startedAt).getTime() : getIrrigationStartTime(landId)

		if (!startMs) {
			// اگر remainingWater صفر باشد، تایمر از همون لحظه شروع بشه
			startMs = Date.now()
			setIrrigationStartTime(landId, startMs)
		}

		const tick = () => {
			const now = Date.now()
			const remaining = remainingWaterMs != null ? remainingWaterMs : requiredWaterMs
			const elapsed = Math.floor((now - startMs) / 1000)
			let remainingSec = Math.floor(remaining / 1000) - elapsed

			if (remainingWaterMs === 0 || remainingSec < 0) {
				setIsOvertime(true)
				setText(`${formatTime(-remainingSec)} -`)
			} else {
				setIsOvertime(false)
				setText(formatTime(remainingSec))
			}

			if (remainingSec <= -1 && onComplete) {
				onComplete()
				clearInterval(intervalRef.current)
				removeIrrigationStartTime(landId)
			}
		}

		tick()
		clearInterval(intervalRef.current)
		intervalRef.current = setInterval(tick, 1000)

		return () => clearInterval(intervalRef.current)
	}, [landId, startedAt, requiredWaterMs, remainingWaterMs, onComplete])

	return <span className={isOvertime ? styles.textRed : styles.textGreen}>{text}</span>
}

export default TimerDisplay
