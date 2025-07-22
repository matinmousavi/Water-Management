import { Button } from 'antd'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import styles from './WarningModalInUse.module.css'

dayjs.extend(utc)

const TWO_HOURS_IN_SECONDS = 2 * 60 * 60

const WarningModalInUse = ({ onSubmit, onClose, well }) => {
	const [countdown, setCountdown] = useState('00 : 00 : 00')

	const getLocalStorageKey = landId => `irrigation_start_${landId}`

	useEffect(() => {
		const landId = well?.land?._id
		if (!landId) {
			console.error('landId is missing:', landId)
			return
		}

		const localStorageKey = getLocalStorageKey(landId)
		const irrigationStartTime = localStorage.getItem(localStorageKey)

		if (!irrigationStartTime) {
			console.error('irrigationStartTime not found in localStorage for landId:', landId)
			return
		}

		const startTime = parseInt(irrigationStartTime, 10)

		const updateCountdown = () => {
			const now = Date.now()
			const elapsedSeconds = Math.floor((now - startTime) / 1000)
			const remainingSeconds = TWO_HOURS_IN_SECONDS - elapsedSeconds

			const isOvertime = remainingSeconds < 0
			const absRemaining = Math.abs(remainingSeconds)

			const hrs = Math.floor(absRemaining / 3600)
			const mins = Math.floor((absRemaining % 3600) / 60)
			const secs = absRemaining % 60

			const formattedTime = `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}${
				isOvertime ? ' -' : ''
			}`

			setCountdown(formattedTime)
		}

		updateCountdown()
		const interval = setInterval(updateCountdown, 1000)

		return () => clearInterval(interval)
	}, [well?.land?._id])

	return (
		<div className={styles.container_fixed}>
			<div className={styles.container}>
				<div className={styles.btn_sheet} onClick={onClose} />

				<div className={styles.title}>شما در حال آبیاری زمین {well?.land?.title} هستید!</div>

				<div className={styles.wrapper_subtitle}>
					<p className={styles.subtitle}>
						هنوز مدت زمان
						<span className={styles.countdown}> {countdown} </span>
						به پایان زمان آبیاری زمین {well?.land?.title} باقی مانده است.
					</p>
					<p className={styles.subtitle}>از پایان دادن به زمان‌ آبیاری اطمینان دارید؟ </p>
				</div>

				<div className={styles.container_buttons}>
					<Button onClick={onClose} className={`${styles.btn_cancel} style-btn`}>
						بازگشت
					</Button>
					<Button onClick={onSubmit} className={styles.btn_end}>
						پایان آبیاری
					</Button>
				</div>
			</div>
		</div>
	)
}

export default WarningModalInUse
