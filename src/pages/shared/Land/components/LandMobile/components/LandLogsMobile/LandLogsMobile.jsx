import { Button, Card, Flex, Typography } from 'antd'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { useState } from 'react'
import { useParams } from 'react-router'

import styles from './LandLogsMobile.module.css'
import TimeEndPickerSheet from '../../../../../../../components/responsive/mobile/TimeEndPickerSheet/TimeEndPickerSheet'
import TimeStartPickerSheet from '../../../../../../../components/responsive/mobile/TimeStartPickerSheet/TimeStartPickerSheet'
import EndNoticeDrawer from '../../../../../../../components/responsive/mobile/EndNoticeDrawer/EndNoticeDrawer'
import MobileLogsTable from '../../../../../../../components/responsive/mobile/MobileLogsTable/MobileLogsTable'
import TimerDisplay from '../../../../../../../components/common/TimerDisplay/TimerDisplay'
import WarningModalInUse from '../../../../../../../components/responsive/mobile/WarningModalInUse/WarningModalInUse'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'

dayjs.extend(jalaliday)
dayjs.extend(customParseFormat)

const { Text } = Typography

const parseTimeToMs = str => {
	if (!str) return 0
	const isNegative = str.startsWith('-')
	const cleanStr = isNegative ? str.substring(1) : str
	const [h, m] = cleanStr.split(':').map(Number)
	const ms = (h * 60 * 60 + m * 60) * 1000
	return isNegative ? -ms : ms
}

const normalizeLogs = rawLogs =>
	(Array.isArray(rawLogs) ? rawLogs : []).map(l => ({
		...l,
		isOngoing: Boolean(l.isOngoing),
	}))

const LandLogsMobile = ({ initialLogs = [], wellId, receivedWater, requiredWater, remainingWater }) => {
	const { landId } = useParams()
	const api = useAPI()
	const apiTime = useAPI()
	const landApi = useAPI()
	const { openNotification } = useNotification()

	const [currentTime, setCurrentTime] = useState(dayjs())
	const [logs, setLogs] = useState(normalizeLogs(initialLogs))
	const [localRequiredWater, setLocalRequiredWater] = useState(requiredWater)
	const [localRemainingWater, setLocalRemainingWater] = useState(remainingWater)
	const [localReceivedWater, setLocalReceivedWater] = useState(receivedWater)
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [isOpenWarning, setIsOpenWarning] = useState(false)

	apiTime.init('settings/irrigations')
	const descriptionEditHours = apiTime.data?.data?.descriptionEditHours?.time
	const latestLog = logs[0] ?? null
	const ongoingLog = latestLog?.isOngoing ? latestLog : null
	const isIrrigating = Boolean(ongoingLog)
	const startedAt = ongoingLog?.startedAt ?? null

	const updatedRequiredWater = localRequiredWater ?? requiredWater
	const updatedRemainingWater = localRemainingWater ?? remainingWater
	const updatedReceivedWater = localReceivedWater ?? receivedWater

	const calculateActualRemainingWater = () => {
		const requiredMs = parseTimeToMs(updatedRequiredWater)
		const receivedMs = parseTimeToMs(updatedReceivedWater)
		const remainingMs = requiredMs - receivedMs

		if (remainingMs < 0 && parseTimeToMs(updatedRemainingWater) === 0) {
			return remainingMs
		}

		return parseTimeToMs(updatedRemainingWater)
	}

	const actualRemainingWaterMs = calculateActualRemainingWater()

	const handleOpenStart = () => {
		setCurrentTime(dayjs())
		if (ongoingLog) setIsOpenWarning(true)
		else setShowStartDrawer(true)
	}

	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)
		if (ongoingLog) return

		const t = dayjs(selectedTime, 'HH:mm')
		const combined = dayjs().startOf('day').hour(t.hour()).minute(t.minute()).second(0).millisecond(0)
		const tempId = `temp-${Date.now()}`
		const newLog = {
			_id: tempId,
			land: landId,
			well: wellId,
			startedAt: combined.toISOString(),
			isOngoing: true,
			note: '',
			duration: null,
		}

		setLogs(prev => [newLog, ...prev])

		try {
			const resp = await api.post('irrigations', {
				landId,
				wellId,
				startTime: combined.toISOString(),
				isOngoing: true,
			})
			const created = resp?.irrigation
			if (created) {
				setLogs(prev => prev.map(log => (log._id === tempId ? { ...created, isOngoing: Boolean(created.isOngoing) } : log)))
			}
		} catch (err) {
			console.error(err)
			setLogs(prev => prev.filter(log => log._id !== tempId))
			openNotification('error', 'خطا در شروع آبیاری')
		}
	}

	const handleTimeEndSelected = async time => {
		setShowEndDrawer(false)
		if (!ongoingLog) return openNotification('error', 'لاگ فعالی یافت نشد')

		const t = dayjs(time, 'HH:mm')
		const combined = dayjs(ongoingLog.startedAt).hour(t.hour()).minute(t.minute()).second(0).millisecond(0)
		const endedAtISO = combined.toISOString()
		const originalId = ongoingLog._id

		setLogs(prev => prev.map(log => (log._id === originalId ? { ...log, isOngoing: false, endedAt: endedAtISO } : log)))

		try {
			if (String(originalId).startsWith('temp-')) {
				await api.post('irrigations', {
					landId,
					wellId,
					startTime: ongoingLog.startedAt,
					endTime: endedAtISO,
					isOngoing: false,
				})
			} else {
				await api.patch(`irrigations/${originalId}`, { endTime: endedAtISO, isOngoing: false })
			}

			const landResponse = await landApi.get(`lands/${landId}`)
			console.log(landResponse)
			const rawNewLogs = landResponse?.land.logs ?? []
			const finalLogs = rawNewLogs.filter(l => !String(l._id).startsWith('temp-')).map(l => ({ ...l }))
			setLogs(finalLogs)

			if (landResponse?.remainingWater !== undefined) setLocalRemainingWater(landResponse.remainingWater)
			if (landResponse?.requiredWater !== undefined) setLocalRequiredWater(landResponse.requiredWater)
			if (landResponse?.receivedWater !== undefined) setLocalReceivedWater(landResponse.receivedWater)

			openNotification('success', 'آبیاری با موفقیت پایان یافت')
		} catch (error) {
			console.error(error)
			openNotification('error', 'خطا در پایان آبیاری')
		}
	}

	const handleWarningModal = () => {
		setIsOpenWarning(false)
		setShowEndDrawer(true)
	}

	return (
		<div className={styles.container}>
			<Card>
				<Flex vertical gap={8}>
					<Text className={styles.titleLogs}>لاگ توزیع آب ({logs.length})</Text>
					<MobileLogsTable logs={logs} descriptionEditHours={descriptionEditHours} />
				</Flex>
			</Card>

			<div className={styles.footer}>
				{isIrrigating ? (
					<Flex align='center' gap={12} className={styles.footerContent}>
						<Text className={styles.timerText}>
							<TimerDisplay
								key={latestLog?._id ?? 'no-ongoing'}
								startedAt={startedAt}
								requiredWaterMs={parseTimeToMs(updatedRequiredWater)}
								remainingWaterMs={actualRemainingWaterMs}
							/>
						</Text>
						<Button type='default' className={styles.textBtn} onClick={() => setEndNoticeDrawer(true)}>
							پایان آبیاری
						</Button>
					</Flex>
				) : (
					<Button type='primary' className={`button-modal ${styles.btnModal}`} block onClick={handleOpenStart}>
						شروع آبیاری
					</Button>
				)}
			</div>

			<TimeStartPickerSheet isOpen={showStartDrawer} now={currentTime} onSubmit={handleTimeStartSelected} onClose={() => setShowStartDrawer(false)} />

			<TimeEndPickerSheet
				isOpen={showEndDrawer}
				title='ثبت زمان پایان آبیاری'
				subtitle='ساعت پایان آبیاری زمین را مشخص کنید.'
				onSubmit={handleTimeEndSelected}
				onClose={() => setShowEndDrawer(false)}
			/>

			<EndNoticeDrawer
				isOpen={endNoticeDrawer}
				onSubmit={() => {
					setEndNoticeDrawer(false)
					setShowEndDrawer(true)
				}}
				timer={<TimerDisplay startedAt={startedAt} requiredWaterMs={parseTimeToMs(updatedRequiredWater)} remainingWaterMs={actualRemainingWaterMs} />}
				onClose={() => setEndNoticeDrawer(false)}
			/>

			<WarningModalInUse
				isOpen={isOpenWarning}
				onClose={() => setIsOpenWarning(false)}
				well={{
					logs: ongoingLog ? [{ ...ongoingLog }] : [],
					requiredWater: updatedRequiredWater,
					remainingWater: updatedRemainingWater,
					land: ongoingLog?.land,
				}}
				onSubmit={handleWarningModal}
			/>
		</div>
	)
}

export default LandLogsMobile
