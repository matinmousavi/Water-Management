import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Drawer } from 'antd'
import styles from './LandInfoMobile.module.css'
import { useState, useEffect } from 'react'
import TimeStartPickerSheet from './components/TimeStartPickerSheet/TimeStartPickerSheet'
import TimeEndPickerSheet from './components/TimeEndPickerSheet/TimeEndPickerSheet'
import EndNoticeDrawer from './components/EndNoticeDrawer/EndNoticeDrawer'
import useAPI from '../../../../../../../hooks/useAPI'
import { useParams } from 'react-router'
import TableAndInfoMobile from './components/TableAndInfoMobile/TableAndInfoMobile'
import WarningModalInUse from './components/WarningModalInUse/WarningModalInUse'

dayjs.extend(jalaliday)
dayjs.extend(customParseFormat)

const TWO_HOURS_IN_SECONDS = 2 * 60 * 60

const LandInfoMobile = ({ data }) => {
	const { landId } = useParams()
	const api = useAPI()

	const [logs, setLogs] = useState([])
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [showEndOtherDrawer, setShowEndOtherDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [remainingTime, setRemainingTime] = useState(null)
	const [isIrrigating, setIsIrrigating] = useState(false)
	const [showWellInUseWarning, setShowWellInUseWarning] = useState(false)
	const [currentIrrigatingWell, setCurrentIrrigatingWell] = useState(null)
	const [isOvertime, setIsOvertime] = useState(false)

	const getLocalStorageKey = () => `irrigation_start_${landId}`

	useEffect(() => {
		if (data?.logs?.length && logs.length === 0) {
			setLogs(data.logs)
		}
	}, [data?.logs])

	useEffect(() => {
		const fetchCurrentIrrigatingLand = async () => {
			const wells = data?.wells || []

			for (const well of wells) {
				try {
					const response = await api.get(`wells/${well._id}`)
					const allLogs = response?.well?.logs || []

					const ongoing = allLogs.find(log => log.isOngoing)
					if (ongoing?.land && ongoing.land._id !== data._id) {
						setCurrentIrrigatingWell({
							...well,
							land: ongoing.land,
							irrigationStartedAt: well.irrigationStartedAt,
							ongoingIrrigationId: ongoing._id,
						})
						break
					}
				} catch (error) {
					console.error('خطا در دریافت اطلاعات چاه:', error)
				}
			}
		}

		fetchCurrentIrrigatingLand()
	}, [data?.wells])

	const formatTime = seconds => {
		const hrs = Math.floor(seconds / 3600)
		const mins = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
	}

	useEffect(() => {
		if (!logs || logs.length === 0) return

		const ongoingLog = logs.find(log => log.isOngoing)
		if (!ongoingLog) {
			setIsIrrigating(false)
			setRemainingTime(0)
			setIsOvertime(false)

			localStorage.removeItem(getLocalStorageKey())
			return
		}

		setIsIrrigating(true)

		const localStorageKey = getLocalStorageKey()
		let irrigationStartTime = localStorage.getItem(localStorageKey)

		if (!irrigationStartTime) {
			irrigationStartTime = Date.now()
			localStorage.setItem(localStorageKey, irrigationStartTime.toString())
		} else {
			irrigationStartTime = parseInt(irrigationStartTime, 10)
		}

		const updateRemaining = () => {
			const now = Date.now()
			const elapsed = Math.floor((now - irrigationStartTime) / 1000)
			const remaining = TWO_HOURS_IN_SECONDS - elapsed

			setRemainingTime(Math.abs(remaining))
			setIsOvertime(remaining < 0)
		}

		updateRemaining()
		const interval = setInterval(updateRemaining, 1000)

		return () => clearInterval(interval)
	}, [logs, landId])

	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)
		try {
			const now = dayjs()
			const time = dayjs(selectedTime, 'HH:mm')
			const combined = now.hour(time.hour()).minute(time.minute()).second(0).millisecond(0)

			const response = await api.post('irrigations', {
				landId,
				wellId: data?.wells[0]?._id,
				startTime: combined.toISOString(),
				isOngoing: true,
			})

			const localStorageKey = getLocalStorageKey()
			localStorage.setItem(localStorageKey, Date.now().toString())

			setLogs(prevLogs => [response?.irrigation, ...prevLogs])
		} catch (error) {
			console.error('خطا در ارسال زمان شروع آبیاری:', error)
		}
	}

	const handleTimeEndSelected = async time => {
		setShowEndDrawer(false)
		try {
			const ongoing = logs.find(item => item.isOngoing && item.startedAt)
			if (!ongoing) return

			const now = dayjs()
			const timeMoment = dayjs(time, 'HH:mm')
			const combined = now.set('hour', timeMoment.hour()).set('minute', timeMoment.minute()).set('second', 0).set('millisecond', 0)

			const response = await api.patch(`irrigations/${ongoing._id}`, {
				endTime: combined.toISOString(),
			})

			localStorage.removeItem(getLocalStorageKey())

			setLogs(prevLogs => prevLogs.filter(log => log._id !== ongoing._id).concat(response?.irrigation))
		} catch (error) {
			console.error('خطا در ثبت زمان پایان آبیاری:', error)
		}
	}

	const handleEndOtherSelected = async selectedTime => {
		setShowEndOtherDrawer(false)

		try {
			// پایان آبیاری زمین دیگر با زمان انتخابی کاربر
			await api.patch(`irrigations/${currentIrrigatingWell.ongoingIrrigationId}`, {
				endTime: selectedTime.toISOString(),
			})

			// نمایش کشوی انتخاب زمان شروع برای زمین فعلی
			setShowStartDrawer(true)
		} catch (error) {
			console.error('خطا در پایان آبیاری زمین دیگر:', error)
			alert('خطا در پایان آبیاری زمین دیگر. لطفاً دوباره تلاش کنید.')
		}
	}

	const handleStop = () => setEndNoticeDrawer(true)

	const handleEndNotice = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(true)
	}

	const CancelTimeEnd = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(false)
	}

	const handleStartClick = () => {
		const wells = data?.wells || []
		const isAnyWellUsedByOtherLand = wells.some(well => well.isIrrigating && well.irrigatingLand && well.irrigatingLand._id !== data?._id)

		if (isAnyWellUsedByOtherLand) {
			setShowWellInUseWarning(true)
		} else {
			setShowStartDrawer(true)
		}
	}

	const handleEndOtherIrrigation = () => {
		setShowWellInUseWarning(false)
		setShowEndOtherDrawer(true)
	}

	return (
		<div className={styles.container}>
			<TableAndInfoMobile
				data={data}
				logs={logs}
				time={formatTime(remainingTime || 0)}
				elapsedTime={remainingTime}
				handleStop={handleStop}
				onStartClick={handleStartClick}
				isIrrigating={isIrrigating}
				isOvertime={isOvertime}
			/>

			{/* کشوی انتخاب زمان شروع آبیاری زمین فعلی */}
			<TimeStartPickerSheet isOpen={showStartDrawer} onSubmit={handleTimeStartSelected} onClose={() => setShowStartDrawer(false)} />

			{/* کشوی انتخاب زمان پایان آبیاری زمین فعلی */}
			<TimeEndPickerSheet
				isOpen={showEndDrawer}
				title='ثبت زمان پایان آبیاری'
				subtitle='ساعت پایان آبیاری را مشخص کنید.'
				onSubmit={handleTimeEndSelected}
				onClose={CancelTimeEnd}
			/>

			{/* کشوی انتخاب زمان پایان آبیاری زمین دیگر */}
			<TimeEndPickerSheet
				isOpen={showEndOtherDrawer}
				title='پایان آبیاری زمین دیگر'
				subtitle='ساعت پایان آبیاری زمین دیگر را مشخص کنید.'
				onSubmit={handleEndOtherSelected}
				onClose={() => setShowEndOtherDrawer(false)}
			/>

			{/* کشوی تایید پایان آبیاری زمین فعلی */}
			<EndNoticeDrawer isOpen={endNoticeDrawer} onSubmit={handleEndNotice} time={formatTime(remainingTime || 0)} onClose={CancelTimeEnd} />

			{/* مودال هشدار استفاده چاه توسط زمین دیگر */}
			<WarningModalInUse
				isOpen={showWellInUseWarning}
				onSubmit={handleEndOtherIrrigation}
				onClose={() => setShowWellInUseWarning(false)}
				well={currentIrrigatingWell}
			/>
		</div>
	)
}

export default LandInfoMobile
