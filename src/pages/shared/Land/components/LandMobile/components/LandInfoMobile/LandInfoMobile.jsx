import { Typography, Drawer } from 'antd'
import moment from 'moment-jalaali'
import styles from './LandInfoMobile.module.css'
import { useState, useEffect, useRef } from 'react'
import TimeStartPickerSheet from './components/TimeStartPickerSheet/TimeStartPickerSheet'
import TimeEndPickerSheet from './components/TimeEndPickerSheet/TimeEndPickerSheet'
import EndNoticeDrawer from './components/EndNoticeDrawer/EndNoticeDrawer'
import useAPI from '../../../../../../../hooks/useAPI'
import { useParams } from 'react-router'
import { useIrrigationTimer } from '../../../../../../../contexts/IrrigationTimerContext'
import TableAndInfoMobile from './components/TableAndInfoMobile/TableAndInfoMobile'

const { Text } = Typography

const LandInfoMobile = ({ data }) => {
	const { landId } = useParams()
	const api = useAPI()
	api.init(`lands/${landId}`)

	const [logs, setLogs] = useState([])
	const [startTime, setStartTime] = useState(null)
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)

	const startY = useRef(0)
	const { elapsedTime, isIrrigating, startIrrigation, stopIrrigation, landID } = useIrrigationTimer()

	useEffect(() => {
		if (api.data?.land?.logs?.length && logs.length === 0) {
			setLogs(api.data.land.logs)
		}
	}, [api.data?.land?.logs])

	const formatTime = seconds => {
		const hrs = Math.floor(seconds / 3600)
		const mins = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		return `  ${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
	}

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
		setStartTime(selectedTime)
		startIrrigation(landId)
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
		setStartTime(time)
		stopIrrigation()
		setShowEndDrawer(false)
		try {
			const ongoing = logs.find(item => item.isOngoing && item.land?._id === landId)
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
		setStartTime(null)
	}

	const handleEndNotice = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(true)
		stopIrrigation(false)
	}

	const CancelTimeEnd = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(false)
	}

	return (
		<div className={styles.container}>
			<TableAndInfoMobile
				data={data}
				logs={logs}
				elapsedTime={elapsedTime}
				time={formatTime(elapsedTime)}
				handleStop={handleStop}
				setShowStartDrawer={setShowStartDrawer}
				landID={landID}
				isIrrigating={isIrrigating}
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
					<EndNoticeDrawer onSubmit={handleEndNotice} time={formatTime(elapsedTime)} onClose={CancelTimeEnd} />
				</div>
			</Drawer>
		</div>
	)
}

export default LandInfoMobile
