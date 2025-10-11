import { Button, Card, Flex, Typography } from 'antd'
import moment from 'moment-jalaali'
import { useMemo, useState } from 'react'

import styles from './IrrigationLogsMobile.module.css'
import TimePickerSheet from '../TimePickerSheet/TimePickerSheet'
import EndNoticeDrawer from '../EndNoticeDrawer/EndNoticeDrawer'
import LogsTableMobile from '../LogsTableMobile/LogsTableMobile'
import TimerDisplay from '../../../common/TimerDisplay/TimerDisplay'
import WarningModalInUse from '../WarningModalInUse/WarningModalInUse'
import useNotification from '../../../../hooks/useNotification'
import useAPI from '../../../../hooks/useAPI'

const { Text } = Typography
const END_TIME_MARGIN_MINUTES = 30

const parseTimeToMs = str => {
	if (!str) return 0
	const isNegative = str.startsWith('-')
	const cleanStr = isNegative ? str.substring(1) : str
	const [h, m] = cleanStr.split(':').map(Number)
	const ms = (h * 60 * 60 + m * 60) * 1000
	return isNegative ? -ms : ms
}

const normalizeLogs = rawLogs =>
	(Array.isArray(rawLogs) ? rawLogs : []).map(log => ({
		...log,
		isOngoing: Boolean(log.isOngoing),
	}))

const getEntityMetricsSource = (entityType, response) => {
	if (entityType === 'land') return response?.land
	return response
}

const IrrigationLogsMobile = ({ entityType, entityId, wellId, initialLogs = [], receivedWater, requiredWater, currentIrrigation }) => {
	const api = useAPI()
	const apiTime = useAPI()
	const entityApi = useAPI()
	const { openNotification } = useNotification()

	const [logs, setLogs] = useState(normalizeLogs(initialLogs))
	const [localRequiredWater, setLocalRequiredWater] = useState(requiredWater)
	const [localReceivedWater, setLocalReceivedWater] = useState(receivedWater)
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [isOpenWarning, setIsOpenWarning] = useState(false)
	const [startPickerValue, setStartPickerValue] = useState(moment())
	const [endPickerValue, setEndPickerValue] = useState(moment())

	apiTime.init('settings/irrigations')
	const descriptionEditHours = apiTime.data?.data?.descriptionEditHours?.time
	const logTimeMarginMinutes = apiTime.data?.data?.logTimeMarginMinutes?.time ?? 30

	const updatedRequiredWater = localRequiredWater ?? requiredWater
	const updatedReceivedWater = localReceivedWater ?? receivedWater

	const latestLog = logs[0] ?? null
	const localOngoingLog = logs.find(l => l.isOngoing) || null

	const belongsHere = useMemo(() => {
		if (!currentIrrigation) return false
		if (currentIrrigation.type === 'land' && entityType === 'land') {
			return currentIrrigation.landId === entityId
		}
		if (currentIrrigation.type === 'landGroup' && entityType === 'landGroup') {
			return currentIrrigation.landGroupId === entityId
		}
		return false
	}, [currentIrrigation, entityId, entityType])

	const isLocalIrrigating = Boolean(localOngoingLog && String(localOngoingLog._id || '').startsWith('temp-'))
	const isServerIrrigatingHere = belongsHere && Boolean(currentIrrigation?.id)
	const isIrrigating = isLocalIrrigating || isServerIrrigatingHere

	const timerProps = useMemo(() => {
		if (isLocalIrrigating && localOngoingLog) {
			return {
				startedAtForDisplay: localOngoingLog.startedAt,
				requiredMsForDisplay: parseTimeToMs(updatedRequiredWater),
				baseReceivedMsForDisplay: parseTimeToMs(updatedReceivedWater),
			}
		}
		if (isServerIrrigatingHere && currentIrrigation) {
			return {
				startedAtForDisplay: moment(currentIrrigation.startedAt).toISOString(),
				requiredMsForDisplay: parseTimeToMs(currentIrrigation.requiredWater),
				baseReceivedMsForDisplay: parseTimeToMs(currentIrrigation.receivedWater),
			}
		}
		if (latestLog?.isOngoing) {
			return {
				startedAtForDisplay: latestLog.startedAt,
				requiredMsForDisplay: parseTimeToMs(updatedRequiredWater),
				baseReceivedMsForDisplay: parseTimeToMs(updatedReceivedWater),
			}
		}
		return {
			startedAtForDisplay: null,
			requiredMsForDisplay: 0,
			baseReceivedMsForDisplay: 0,
		}
	}, [isLocalIrrigating, localOngoingLog, isServerIrrigatingHere, currentIrrigation, latestLog, updatedRequiredWater, updatedReceivedWater])

	const handleStartPickerChange = time => {
		const candidate = moment(time)
		if (candidate.isValid()) setStartPickerValue(candidate)
	}

	const handleEndPickerChange = time => {
		const candidate = moment(time)
		if (candidate.isValid()) setEndPickerValue(candidate)
	}

	const handleOpenStart = () => {
		if (currentIrrigation && !belongsHere) {
			setIsOpenWarning(true)
			return
		}
		if (isServerIrrigatingHere) return
		const now = moment()
		setStartPickerValue(now)
		setShowStartDrawer(true)
	}

	const buildTempLog = combined => {
		const tempId = `temp-${Date.now()}`
		const base = {
			_id: tempId,
			well: wellId,
			startedAt: combined.toISOString(),
			isOngoing: true,
			note: '',
			duration: null,
		}
		if (entityType === 'landGroup') return { ...base, landGroup: entityId }
		return { ...base, land: entityId }
	}

	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)
		if (isIrrigating) return

		const normalized = moment(selectedTime)
		if (!normalized.isValid()) return
		const combined = moment().startOf('day').hour(normalized.hour()).minute(normalized.minute()).second(0).millisecond(0)
		const tempLog = buildTempLog(combined)

		setLogs(prev => [tempLog, ...prev])

		try {
			const payload = {
				wellId,
				startTime: combined.toISOString(),
				isOngoing: true,
			}
			if (entityType === 'landGroup') payload.landGroupId = entityId
			else payload.landId = entityId
			await api.post('irrigations', payload)
		} catch {
			setLogs(prev => prev.filter(l => l._id !== tempLog._id))
			openNotification('error', 'خطا در شروع آبیاری')
		}
	}

	const refreshEntityData = async () => {
		if (!entityId || !wellId) return null

		if (entityType === 'landGroup') {
			const response = await entityApi.get(`wells/${wellId}/land-groups/${entityId}`)
			const rawLogs = response?.logs ?? []
			const finalLogs = rawLogs.filter(log => !String(log._id).startsWith('temp-')).map(log => ({ ...log, isOngoing: Boolean(log.isOngoing) }))
			setLogs(finalLogs)

			const metricsSource = getEntityMetricsSource(entityType, response)
			if (metricsSource?.requiredWater !== undefined) setLocalRequiredWater(metricsSource.requiredWater)
			if (metricsSource?.receivedWater !== undefined) setLocalReceivedWater(metricsSource.receivedWater)

			return response
		}

		const response = await entityApi.get(`lands/${entityId}`)
		const rawLogs = response?.land?.logs ?? []
		const finalLogs = rawLogs.filter(log => !String(log._id).startsWith('temp-')).map(log => ({ ...log, isOngoing: Boolean(log.isOngoing) }))
		setLogs(finalLogs)

		const metricsSource = getEntityMetricsSource(entityType, response)
		if (metricsSource?.requiredWater !== undefined) setLocalRequiredWater(metricsSource.requiredWater)
		if (metricsSource?.receivedWater !== undefined) setLocalReceivedWater(metricsSource.receivedWater)

		return response
	}

	const handleTimeEndSelected = async time => {
		setShowEndDrawer(false)

		const activeLocal = logs.find(l => l.isOngoing)
		if (!activeLocal) {
			openNotification('error', 'لاگ فعالی یافت نشد')
			return
		}

		const t = moment(time)
		if (!t.isValid()) return
		const combined = moment(activeLocal.startedAt).hour(t.hour()).minute(t.minute()).second(0).millisecond(0)
		const endedAtISO = combined.toISOString()

		setLogs(prev => prev.map(log => (String(log._id) === String(activeLocal._id) ? { ...log, isOngoing: false, endedAt: endedAtISO } : log)))

		try {
			if (String(activeLocal._id).startsWith('temp-')) {
				const payload = {
					wellId,
					startTime: activeLocal.startedAt,
					endTime: endedAtISO,
					isOngoing: false,
				}
				if (entityType === 'landGroup') payload.landGroupId = entityId
				else payload.landId = entityId
				await api.post('irrigations', payload)
			} else {
				await api.patch(`irrigations/${activeLocal._id}`, { endTime: endedAtISO, isOngoing: false })
			}

			await refreshEntityData()
			openNotification('success', 'آبیاری با موفقیت پایان یافت')
		} catch {
			openNotification('error', 'خطا در پایان آبیاری')
		}
	}

	const handleWarningModalConfirm = async () => {
		setIsOpenWarning(false)
		try {
			await api.patch(`irrigations/${currentIrrigation.id}`, {
				isOngoing: false,
				endTime: new Date().toISOString(),
			})
			openNotification('success', 'آبیاری قبلی با موفقیت پایان یافت.')
			const now = moment()
			setStartPickerValue(now)
			setShowStartDrawer(true)
		} catch {
			openNotification('error', 'پایان آبیاری قبلی با خطا مواجه شد.')
		}
	}

	return (
		<div className={styles.container}>
			<Card>
				<Flex vertical gap={8}>
					<Text className={styles.titleLogs}>لاگ توزیع آب ({logs.length})</Text>
					<LogsTableMobile logs={logs} descriptionEditHours={descriptionEditHours} />
				</Flex>
			</Card>

			<div className={styles.footer}>
				{isIrrigating ? (
					<Flex align='center' gap={12} className={styles.footerContent}>
						<Text className={styles.timerText}>
							<TimerDisplay
								key={(localOngoingLog?._id || currentIrrigation?.id) ?? 'no-ongoing'}
								startedAt={timerProps.startedAtForDisplay}
								requiredMs={timerProps.requiredMsForDisplay}
								baseReceivedMs={timerProps.baseReceivedMsForDisplay}
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

			<TimePickerSheet
				open={showStartDrawer}
				value={startPickerValue}
				onChange={handleStartPickerChange}
				onConfirm={handleTimeStartSelected}
				onClose={() => setShowStartDrawer(false)}
				title='ثبت زمان شروع آبیاری'
				subtitle='ساعت شروع آبیاری را مشخص کنید.'
				confirmText='ثبت'
				cancelText='بازگشت'
				marginMinutesBackward={logTimeMarginMinutes}
			/>

			<TimePickerSheet
				open={showEndDrawer}
				value={endPickerValue}
				onChange={handleEndPickerChange}
				onConfirm={handleTimeEndSelected}
				onClose={() => setShowEndDrawer(false)}
				title='ثبت زمان پایان آبیاری'
				subtitle='ساعت پایان آبیاری زمین را مشخص کنید.'
				confirmText='ثبت'
				cancelText='بازگشت'
				marginMinutesBackward={END_TIME_MARGIN_MINUTES}
			/>

			<EndNoticeDrawer
				isOpen={endNoticeDrawer}
				onSubmit={() => {
					setEndNoticeDrawer(false)
					setEndPickerValue(moment())
					setShowEndDrawer(true)
				}}
				timer={
					<TimerDisplay
						startedAt={timerProps.startedAtForDisplay}
						requiredMs={timerProps.requiredMsForDisplay}
						baseReceivedMs={timerProps.baseReceivedMsForDisplay}
					/>
				}
				onClose={() => setEndNoticeDrawer(false)}
			/>

			<WarningModalInUse
				isOpen={isOpenWarning}
				onClose={() => setIsOpenWarning(false)}
				irrigationTarget={currentIrrigation}
				onSubmit={handleWarningModalConfirm}
			/>
		</div>
	)
}

export default IrrigationLogsMobile
