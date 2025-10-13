import { useEffect, useRef, useState } from 'react'
import moment from 'moment-jalaali'
import styles from './TimerDisplay.module.css'

const pad2 = n => n.toString().padStart(2, '0')
const formatHMS = seconds => {
	const abs = Math.max(0, Math.floor(Math.abs(seconds)))
	const h = Math.floor(abs / 3600)
	const m = Math.floor((abs % 3600) / 60)
	const s = abs % 60
	// نمایش به فرم SS : MM : HH طبق UI فعلی
	return `${pad2(s)} : ${pad2(m)} : ${pad2(h)}`
}

const TimerDisplay = ({ startedAt, requiredMs, baseReceivedMs = 0, onComplete }) => {
	const [text, setText] = useState('00 : 00 : 00')
	const [isOvertime, setIsOvertime] = useState(false)
	const intervalRef = useRef(null)
	const completedRef = useRef(false)

	useEffect(() => {
		// ریست حالت‌ها هنگام تغییر ورودی‌ها
		completedRef.current = false
		setText('00 : 00 : 00')
		setIsOvertime(false)

		if (!startedAt || !requiredMs) return

		const startTs = moment(startedAt).valueOf()
		if (!Number.isFinite(startTs)) return

		const tick = () => {
			const now = Date.now()
			const elapsedMs = Math.max(0, now - startTs)
			const totalReceivedMs = Math.max(0, (baseReceivedMs || 0) + elapsedMs)
			const remainingMs = (requiredMs || 0) - totalReceivedMs
			const remainingSec = Math.floor(remainingMs / 1000)

			const overtime = remainingSec < 0
			setIsOvertime(overtime)
			setText(overtime ? `${formatHMS(-remainingSec)} -` : formatHMS(remainingSec))

			// فقط یک‌بار onComplete را صدا بزن (بعد از رد شدن حداقل ۱ ثانیه)
			if (remainingSec <= -1 && onComplete && !completedRef.current) {
				completedRef.current = true
				onComplete()
				clearInterval(intervalRef.current)
			}
		}

		tick()
		clearInterval(intervalRef.current)
		intervalRef.current = setInterval(tick, 1000)
		return () => clearInterval(intervalRef.current)
	}, [startedAt, requiredMs, baseReceivedMs, onComplete])

	return <span className={isOvertime ? styles.textRed : styles.textGreen}>{text}</span>
}

export default TimerDisplay
