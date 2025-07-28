import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../../../hooks/useAPI'

import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import TimeStartPickerSheet from './components/TimeStartPickerSheet/TimeStartPickerSheet'
import TimeEndPickerSheet from './components/TimeEndPickerSheet/TimeEndPickerSheet'
import EndNoticeDrawer from './components/EndNoticeDrawer/EndNoticeDrawer'
import TableAndInfoMobile from './components/TableAndInfoMobile/TableAndInfoMobile'
import WarningModalInUse from './components/WarningModalInUse/WarningModalInUse'
import TimerDisplay from '../../../../../../../components/TimerDisplay/TimerDisplay'

import styles from './LandInfoMobile.module.css'

import { getIrrigationStartTime, setIrrigationStartTime, removeIrrigationStartTime } from '../../../../../../../utils/irrigationStorage'

dayjs.extend(jalaliday)
dayjs.extend(customParseFormat)

const LandInfoMobile = ({ data }) => {
	const { landId } = useParams()
	const api = useAPI()

	const [logs, setLogs] = useState([])
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [showEndOtherDrawer, setShowEndOtherDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [isIrrigating, setIsIrrigating] = useState(false)
	const [showWellInUseWarning, setShowWellInUseWarning] = useState(false)
	const [currentIrrigatingWell, setCurrentIrrigatingWell] = useState(null)
	const [startedAt, setStartedAt] = useState(null)

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

	useEffect(() => {
		if (!logs || logs.length === 0) return

		const ongoingLog = logs.find(log => log.isOngoing)
		if (!ongoingLog) {
			setIsIrrigating(false)
			setStartedAt(null)
			removeIrrigationStartTime(landId)
			return
		}

		setIsIrrigating(true)

		let irrigationStartTime = getIrrigationStartTime(landId)

		if (!irrigationStartTime) {
			irrigationStartTime = Date.now()
			setIrrigationStartTime(landId, irrigationStartTime)
		}

		setStartedAt(parseInt(irrigationStartTime, 10))
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

			setIrrigationStartTime(landId, Date.now())
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

			removeIrrigationStartTime(landId)

			setLogs(prevLogs => prevLogs.filter(log => log._id !== ongoing._id).concat(response?.irrigation))
		} catch (error) {
			console.error('خطا در ثبت زمان پایان آبیاری:', error)
		}
	}

	const handleEndOtherSelected = async selectedTime => {
		setShowEndOtherDrawer(false)

		try {
			await api.patch(`irrigations/${currentIrrigatingWell.ongoingIrrigationId}`, {
				endTime: selectedTime.toISOString(),
			})

			setShowStartDrawer(true)
		} catch (error) {
			console.error('خطا در پایان آبیاری زمین دیگر:', error)
			alert('خطا در پایان آبیاری زمین دیگر. لطفاً دوباره تلاش کنید.')
		}
	}

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
				handleStop={() => setEndNoticeDrawer(true)}
				onStartClick={handleStartClick}
				isIrrigating={isIrrigating}
				timer={<TimerDisplay startedAt={startedAt} />}
			/>

			<TimeStartPickerSheet isOpen={showStartDrawer} onSubmit={handleTimeStartSelected} onClose={() => setShowStartDrawer(false)} />

			<TimeEndPickerSheet
				isOpen={showEndDrawer}
				title='ثبت زمان پایان آبیاری'
				subtitle='ساعت پایان آبیاری را مشخص کنید.'
				onSubmit={handleTimeEndSelected}
				onClose={CancelTimeEnd}
			/>

			<TimeEndPickerSheet
				isOpen={showEndOtherDrawer}
				title='پایان آبیاری زمین دیگر'
				subtitle='ساعت پایان آبیاری زمین دیگر را مشخص کنید.'
				onSubmit={handleEndOtherSelected}
				onClose={() => setShowEndOtherDrawer(false)}
			/>

			<EndNoticeDrawer isOpen={endNoticeDrawer} onSubmit={handleEndNotice} timer={<TimerDisplay startedAt={startedAt} />} onClose={CancelTimeEnd} />

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
