import moment from 'moment-jalaali'
import { Drawer } from 'antd'
import styles from './LandInfoMobile.module.css'
import { useState, useEffect, useRef } from 'react'
import TimeStartPickerSheet from './components/TimeStartPickerSheet/TimeStartPickerSheet'
import TimeEndPickerSheet from './components/TimeEndPickerSheet/TimeEndPickerSheet'
import EndNoticeDrawer from './components/EndNoticeDrawer/EndNoticeDrawer'
import useAPI from '../../../../../../../hooks/useAPI'
import { useParams } from 'react-router'
import TableAndInfoMobile from './components/TableAndInfoMobile/TableAndInfoMobile'
import WarningModalInUse from './components/WarningModalInUse/WarningModalInUse'

const TWO_HOURS_IN_SECONDS = 2 * 60 * 60

const LandInfoMobile = ({ data }) => {
	const { landId } = useParams()
	const api = useAPI()

	const [logs, setLogs] = useState([])
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [remainingTime, setRemainingTime] = useState(null)
	const [isIrrigating, setIsIrrigating] = useState(false)
	const [showWellInUseWarning, setShowWellInUseWarning] = useState(false)
	const [currentIrrigatingLand, setCurrentIrrigatingLand] = useState(null)
	const [isOvertime, setIsOvertime] = useState(false)

	const startY = useRef(0)

	useEffect(() => {
		if (data?.logs?.length && logs.length === 0) {
			setLogs(data.logs)
		}
	}, [data?.logs])

	useEffect(() => {
		if (!data?.wells?.[0]?._id) return

		const fetchWellData = async () => {
			try {
				const response = await api.get(`wells/${data.wells[0]._id}`)
				const allLogs = response?.well?.logs || []

				const ongoing = allLogs.find(log => log.isOngoing)
				if (ongoing?.land?.title) {
					setCurrentIrrigatingLand(ongoing.land)
				}
			} catch (error) {
				console.error('خطا در دریافت اطلاعات چاه:', error)
			}
		}

		fetchWellData()
	}, [data?.wells])

	const formatTime = seconds => {
		const hrs = Math.floor(seconds / 3600)
		const mins = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		return `  ${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
	}

	useEffect(() => {
		if (!logs || logs.length === 0) return

		const ongoingLog = logs.find(log => log.isOngoing)
		if (!ongoingLog || !ongoingLog.startedAt) {
			setIsIrrigating(false)
			setRemainingTime(0)
			setIsOvertime(false)
			return
		}
		setIsIrrigating(true)

		const startedAt = new Date(ongoingLog.startedAt).getTime()

		const updateRemaining = () => {
			const now = Date.now()
			const elapsed = Math.floor((now - startedAt) / 1000)
			const remaining = Math.max(0, TWO_HOURS_IN_SECONDS - elapsed)

			setRemainingTime(Math.abs(remaining))
			setIsOvertime(remaining < 0)
		}

		updateRemaining()
		const interval = setInterval(updateRemaining, 1000)

		return () => clearInterval(interval)
	}, [logs])

	const handleTouchStart = e => {
		startY.current = e.touches[0].clientY
	}

	const handleTouchMove = e => {
		const deltaY = e.touches[0].clientY - startY.current
		if (deltaY > 100) {
			setShowStartDrawer(false)
			setShowEndDrawer(false)
		}
	}

	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)

		try {
			const now = moment()
			const time = moment(selectedTime, 'HH:mm')
			const combined = now.clone().hour(time.hour()).minute(time.minute()).second(0).millisecond(0)

			const response = await api.post('irrigations', {
				landId,
				wellId: data?.wells[0]?._id,
				startTime: combined.toISOString(),
				isOngoing: true,
			})
			setLogs(prevLogs => {
				const updatedLogs = [response?.irrigation, ...prevLogs]
				return updatedLogs
			})
		} catch (error) {
			console.error('خطا در ارسال زمان شروع آبیاری:', error)
		}
	}

	const handleTimeEndSelected = async time => {
		setShowEndDrawer(false)
		try {
			const ongoing = logs.find(item => item.isOngoing && item.startedAt)
			if (!ongoing) return

			const now = moment()
			const timeMoment = moment(time, 'HH:mm')
			const combined = now.clone().hour(timeMoment.hour()).minute(timeMoment.minute()).second(0).millisecond(0)

			const response = await api.patch(`irrigations/${ongoing._id}`, {
				endTime: combined.toISOString(),
			})
			setLogs(prevLogs => {
				const updatedLogs = prevLogs.filter(log => log._id !== ongoing._id).concat(response?.irrigation)

				return updatedLogs
			})
		} catch (error) {
			console.error('خطا در ثبت زمان پایان آبیاری:', error)
		}
	}

	const handleStop = () => {
		setEndNoticeDrawer(true)
	}

	const handleEndNotice = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(true)
	}

	const handleEndIrrigation = () => {
		setShowStartDrawer(true)
		setShowWellInUseWarning(false)
	}

	const CancelTimeEnd = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(false)
	}

	const CancelWarning = () => {
		setShowWellInUseWarning(false)
	}

	const handleStartClick = () => {
		if (data?.wells?.[0]?.isIrrigating) {
			setShowWellInUseWarning(true)
		} else {
			setShowStartDrawer(true)
		}
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

			<Drawer title={null} placement='bottom' height='auto' open={showStartDrawer} onClose={() => setShowStartDrawer(false)} closable={false}>
				<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<TimeStartPickerSheet onSubmit={handleTimeStartSelected} onClose={() => setShowStartDrawer(false)} />
				</div>
			</Drawer>

			<Drawer title={null} placement='bottom' height='auto' open={showEndDrawer} onClose={() => setShowEndDrawer(false)} closable={false}>
				<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<TimeEndPickerSheet onSubmit={handleTimeEndSelected} onClose={CancelTimeEnd} />
				</div>
			</Drawer>

			<Drawer title={null} placement='bottom' height='auto' open={endNoticeDrawer} onClose={() => setEndNoticeDrawer(false)} closable={false}>
				<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<EndNoticeDrawer onSubmit={handleEndNotice} time={formatTime(remainingTime || 0)} onClose={CancelTimeEnd} />
				</div>
			</Drawer>

			<Drawer title={null} placement='bottom' height='auto' open={showWellInUseWarning} onClose={() => setEndNoticeDrawer(false)} closable={false}>
				<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<WarningModalInUse
						onSubmit={handleEndIrrigation}
						time={formatTime(remainingTime || 0)}
						onClose={CancelWarning}
						land={currentIrrigatingLand}
					/>
				</div>
			</Drawer>
		</div>
	)
}

export default LandInfoMobile
