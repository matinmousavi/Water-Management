import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../../../hooks/useAPI'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import TimeStartPickerSheet from './components/TimeStartPickerSheet/TimeStartPickerSheet'
import TimeEndPickerSheet from './components/TimeEndPickerSheet/TimeEndPickerSheet'
import EndNoticeDrawer from './components/EndNoticeDrawer/EndNoticeDrawer'
import TableLogsMobile from './components/TableLogsMobile/TableLogsMobile'
import WarningModalInUse from './components/WarningModalInUse/WarningModalInUse'
import TimerDisplay from '../../../../../../../components/TimerDisplay/TimerDisplay'

import styles from './LandLogsMobile.module.css'

dayjs.extend(jalaliday)
dayjs.extend(customParseFormat)

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000 // 2h

const parseDurationToMs = str => {
	if (!str) return null
	const [h, m] = str.split(':').map(Number)
	return (h * 60 * 60 + m * 60) * 1000
}

const LandLogsMobile = ({ data }) => {
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

	const lsKey = `irrigation_start_${landId}`

	useEffect(() => {
		if (data?.logs?.length && logs.length === 0) setLogs(data.logs)
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
				} catch (e) {
					console.error('خطا در دریافت اطلاعات چاه:', e)
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
			localStorage.removeItem(lsKey)
			return
		}

		setIsIrrigating(true)
		const apiStartMs = dayjs(ongoingLog.startedAt).valueOf()
		const lsValMs = Number(localStorage.getItem(lsKey)) || null

		if (!lsValMs || Number.isNaN(lsValMs)) {
			localStorage.setItem(lsKey, String(apiStartMs))
			setStartedAt(apiStartMs)
		} else {
			const drift = Math.abs(lsValMs - apiStartMs)
			if (drift > 2000) {
				localStorage.setItem(lsKey, String(apiStartMs))
				setStartedAt(apiStartMs)
			} else {
				setStartedAt(lsValMs)
			}
		}
	}, [logs, landId])

	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)
		try {
			const now = dayjs()
			const t = dayjs(selectedTime, 'HH:mm')
			const combined = now.hour(t.hour()).minute(t.minute()).second(0).millisecond(0)

			const currentWell = data?.wells?.[0]

			const res = await api.post('irrigations', {
				landId,
				wellId: currentWell?._id,
				startTime: combined.toISOString(),
				isOngoing: true,
			})

			const startedAtServer = res?.irrigation?.startedAt
			const startMs = startedAtServer ? dayjs(startedAtServer).valueOf() : combined.valueOf()
			localStorage.setItem(lsKey, String(startMs))
			setStartedAt(startMs)
			setIsIrrigating(true)
			setLogs(prev => [res?.irrigation, ...prev])
		} catch (e) {
			console.error('خطا در ارسال زمان شروع آبیاری:', e)
		}
	}

	const handleTimeEndSelected = async time => {
		setShowEndDrawer(false)
		try {
			const ongoing = logs.find(item => item.isOngoing && item.startedAt)
			if (!ongoing) return

			const now = dayjs()
			const t = dayjs(time, 'HH:mm')
			const combined = now.set('hour', t.hour()).set('minute', t.minute()).set('second', 0).set('millisecond', 0)

			const res = await api.patch(`irrigations/${ongoing._id}`, {
				endTime: combined.toISOString(),
			})

			localStorage.removeItem(lsKey)
			setIsIrrigating(false)
			setStartedAt(null)
			setLogs(prev => prev.filter(l => l._id !== ongoing._id).concat(res?.irrigation))
		} catch (e) {
			console.error('خطا در ثبت زمان پایان آبیاری:', e)
		}
	}

	const handleEndOtherSelected = async selectedTime => {
		setShowEndOtherDrawer(false)
		try {
			await api.patch(`irrigations/${currentIrrigatingWell.ongoingIrrigationId}`, {
				endTime: selectedTime.toISOString(),
			})
			setShowStartDrawer(true)
		} catch (e) {
			console.error('خطا در پایان آبیاری زمین دیگر:', e)
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
		const inUseByOther = wells.some(w => w.isIrrigating && w.irrigatingLand?._id !== data._id)
		if (inUseByOther) setShowWellInUseWarning(true)
		else setShowStartDrawer(true)
	}

	const handleEndOtherIrrigation = () => {
		setShowWellInUseWarning(false)
		setShowEndOtherDrawer(true)
	}

	const currentWell = data?.wells?.find(w => w.irrigatingLand?._id === data._id) || data?.wells?.[0]
	let remainingMs = parseDurationToMs(currentWell?.remainingWater)
	if (!remainingMs || Number.isNaN(remainingMs)) remainingMs = DEFAULT_DURATION_MS

	return (
		<div className={styles.container}>
			<TableLogsMobile
				data={data}
				logs={logs}
				handleStop={() => setEndNoticeDrawer(true)}
				onStartClick={handleStartClick}
				isIrrigating={isIrrigating}
				startedAt={startedAt}
				durationMs={remainingMs}
				onNoteUpdate={(id, newNote) => {
					setLogs(prevLogs => prevLogs.map(l => (l._id === id ? { ...l, note: newNote } : l)))
				}}
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

			<EndNoticeDrawer
				isOpen={endNoticeDrawer}
				onSubmit={handleEndNotice}
				timer={<TimerDisplay startedAt={startedAt} durationMs={remainingMs} />}
				onClose={CancelTimeEnd}
			/>

			<WarningModalInUse
				isOpen={showWellInUseWarning}
				onSubmit={handleEndOtherIrrigation}
				onClose={() => setShowWellInUseWarning(false)}
				well={currentIrrigatingWell}
			/>
		</div>
	)
}

export default LandLogsMobile
