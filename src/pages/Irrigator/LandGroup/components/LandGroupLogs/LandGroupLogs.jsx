import { Button, Card, Flex, Typography } from 'antd'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { useState, useOptimistic, useTransition } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../hooks/useAPI'

import styles from './LandGroupLogs.module.css'
import TimeEndPickerSheet from '../../../../../components/responsive/mobile/TimeEndPickerSheet/TimeEndPickerSheet'
import TimeStartPickerSheet from '../../../../../components/responsive/mobile/TimeStartPickerSheet/TimeStartPickerSheet'
import EndNoticeDrawer from '../../../../../components/responsive/mobile/EndNoticeDrawer/EndNoticeDrawer'
import MobileLogsTable from '../../../../../components/responsive/mobile/MobileLogsTable/MobileLogsTable'
import TimerDisplay from '../../../../../components/common/TimerDisplay/TimerDisplay'
import WarningModalInUse from '../../../../../components/responsive/mobile/WarningModalInUse/WarningModalInUse'
import useNotification from '../../../../../hooks/useNotification'

dayjs.extend(jalaliday)
dayjs.extend(customParseFormat)

const { Text } = Typography

const parseTimeToMs = str => {
	if (!str) return 0
	const [h, m] = str.split(':').map(Number)
	return (h * 60 * 60 + m * 60) * 1000
}

const LandGroupLogs = ({ initialLogs = [], requiredWater, remainingWater }) => {
	const { wellId, groupId } = useParams()
	const api = useAPI()
	const apiTime = useAPI()
	const landGroupApi = useAPI()

	const { openNotification } = useNotification()

	const [isPending, startTransition] = useTransition()
	const [logs, setLogs] = useState(initialLogs || [])
	const [currentTime, setCurrentTime] = useState(dayjs())
	const [localRequiredWater, setLocalRequiredWater] = useState(requiredWater)
	const [localRemainingWater, setLocalRemainingWater] = useState(remainingWater)

	const [optimisticLogs, addOptimisticLog] = useOptimistic(logs, (state, { action, payload }) => {
		switch (action) {
			case 'START_IRRIGATION':
				return [payload.optimisticLog, ...state]

			case 'END_IRRIGATION':
				return state.map(log => (log._id === payload.originalId ? { ...log, isOngoing: false, endedAt: payload.endedAt } : log))

			case 'REPLACE_TEMP':
				return state.map(log => (log._id === payload.tempId ? payload.actualLog : log))

			case 'ROLLBACK':
				return state.filter(log => log._id !== payload.tempId)

			case 'UPDATE_LOGS':
				return payload.newLogs

			default:
				return state
		}
	})

	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [isOpenWarning, setIsOpenWarning] = useState(false)

	const ongoingLog = optimisticLogs.find(log => log.isOngoing)
	const isIrrigating = Boolean(ongoingLog)
	const startedAt = ongoingLog?.startedAt ?? null

	const descriptionEditHours = apiTime.data?.data?.descriptionEditHours?.time

	const handleOpenStart = () => {
		setCurrentTime(dayjs())
		if (ongoingLog) {
			setIsOpenWarning(true)
		} else {
			setShowStartDrawer(true)
		}
	}

	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)

		const t = dayjs(selectedTime, 'HH:mm')
		const combined = dayjs().startOf('day').hour(t.hour()).minute(t.minute()).second(0).millisecond(0)

		const tempId = `temp-${Date.now()}`
		const optimisticLog = {
			_id: tempId,
			landGroup: groupId,
			well: wellId,
			startedAt: combined.toISOString(),
			isOngoing: true,
			note: '',
			duration: null,
			_isOptimistic: true,
		}

		// آپدیت همزمان هر دو state
		startTransition(() => {
			addOptimisticLog({
				action: 'START_IRRIGATION',
				payload: { optimisticLog },
			})
		})
		setLogs(prev => [optimisticLog, ...prev])

		try {
			console.log('شروع آبیاری - ارسال درخواست:', {
				landGroupId: groupId,
				wellId,
				startTime: combined.toISOString(),
				isOngoing: true,
			})

			const response = await api.post('irrigations', {
				landGroupId: groupId,
				wellId,
				startTime: combined.toISOString(),
				isOngoing: true,
			})

			console.log('شروع آبیاری - پاسخ API:', response)

			const created = response?.irrigation
			if (created) {
				console.log('شروع آبیاری - لاگ ایجاد شده:', created)

				startTransition(() => {
					addOptimisticLog({
						action: 'REPLACE_TEMP',
						payload: { tempId, actualLog: created },
					})
				})
				setLogs(prev => prev.map(l => (l._id === tempId ? created : l)))

				openNotification('success', 'آبیاری با موفقیت شروع شد')
			}
		} catch (error) {
			console.error('خطا در شروع آبیاری گروهی:', error)
			console.error('جزئیات خطا:', error.response?.data || error.message)

			startTransition(() => {
				addOptimisticLog({
					action: 'ROLLBACK',
					payload: { tempId },
				})
			})
			setLogs(prev => prev.filter(l => l._id !== tempId))

			openNotification('error', 'خطا در شروع آبیاری')
		}
	}

	const handleTimeEndSelected = async time => {
		setShowEndDrawer(false)

		if (!ongoingLog) {
			openNotification('error', 'لاگ فعالی یافت نشد')
			return
		}

		const t = dayjs(time, 'HH:mm')
		const combined = dayjs(ongoingLog.startedAt).hour(t.hour()).minute(t.minute()).second(0).millisecond(0)
		const endedAtISO = combined.toISOString()

		const originalId = ongoingLog._id
		const isTempLog = String(originalId).startsWith('temp-')

		console.log('پایان آبیاری - اطلاعات:', {
			originalId,
			isTempLog,
			endedAtISO,
			startedAt: ongoingLog.startedAt,
		})

		// آپدیت همزمان هر دو state
		startTransition(() => {
			addOptimisticLog({
				action: 'END_IRRIGATION',
				payload: { originalId, endedAt: endedAtISO },
			})
		})
		setLogs(prev => prev.map(l => (l._id === originalId ? { ...l, isOngoing: false, endedAt: endedAtISO } : l)))

		try {
			let response

			if (isTempLog) {
				console.log('پایان آبیاری - ایجاد لاگ جدید (موقت)')
				response = await api.post('irrigations', {
					landGroupId: groupId,
					wellId,
					startTime: ongoingLog.startedAt,
					endTime: endedAtISO,
					isOngoing: false,
				})
			} else {
				console.log('پایان آبیاری - آپدیت لاگ موجود:', originalId)
				response = await api.patch(`irrigations/${originalId}`, {
					endTime: endedAtISO,
					isOngoing: false,
				})
			}

			console.log('پایان آبیاری - پاسخ API:', response)

			const updatedLog = response?.irrigation
			if (updatedLog) {
				console.log('پایان آبیاری - لاگ آپدیت شده:', updatedLog)

				// بررسی کنیم که آیا لاگ واقعاً پایان یافته
				if (updatedLog.isOngoing) {
					console.warn('⚠️ لاگ هنوز isOngoing: true است! این یک مشکل سروری است.')
					// به صورت دستی وضعیت رو اصلاح می‌کنیم
					updatedLog.isOngoing = false
				}

				if (isTempLog) {
					startTransition(() => {
						addOptimisticLog({
							action: 'REPLACE_TEMP',
							payload: { tempId: originalId, actualLog: updatedLog },
						})
					})
					setLogs(prev => prev.map(l => (l._id === originalId ? updatedLog : l)))
				} else {
					setLogs(prev => prev.map(l => (l._id === originalId ? updatedLog : l)))
				}

				// رفرش داده‌های گروه
				console.log('رفرش داده‌های گروه...')
				const landGroupResponse = await landGroupApi.get(`wells/${wellId}/land-groups/${groupId}`)
				console.log('داده‌های گروه بعد از پایان آبیاری:', landGroupResponse)

				// آپدیت مقادیر آب از داده‌های گروه
				if (landGroupResponse?.remainingWater) {
					setLocalRemainingWater(landGroupResponse.remainingWater)
				}
				if (landGroupResponse?.requiredWater) {
					setLocalRequiredWater(landGroupResponse.requiredWater)
				}

				openNotification('success', 'آبیاری با موفقیت پایان یافت')
			}
		} catch (error) {
			console.error('خطا در پایان آبیاری گروهی:', error)
			console.error('جزئیات خطا:', error.response?.data || error.message)

			// Rollback به state قبلی
			const currentLogs = logs
			console.log('انجام rollback به state قبلی:', currentLogs)

			startTransition(() => {
				addOptimisticLog({
					action: 'UPDATE_LOGS',
					payload: { newLogs: currentLogs },
				})
			})
			setLogs(currentLogs)

			openNotification('error', 'خطا در پایان آبیاری')
		}
	}

	const handleWarningModal = () => {
		setIsOpenWarning(false)
		setShowEndDrawer(true)
	}

	// استفاده از مقادیر محلی که با API آپدیت می‌شوند
	const updatedRequiredWater = landGroupApi.data?.requiredWater ?? localRequiredWater ?? requiredWater
	const updatedRemainingWater = landGroupApi.data?.remainingWater ?? localRemainingWater ?? remainingWater

	console.log('مقادیر آب:', {
		requiredWater,
		remainingWater,
		localRequiredWater,
		localRemainingWater,
		landGroupRequired: landGroupApi.data?.requiredWater,
		landGroupRemaining: landGroupApi.data?.remainingWater,
		finalRequired: updatedRequiredWater,
		finalRemaining: updatedRemainingWater,
	})

	return (
		<div className={styles.container}>
			<Card>
				<Flex vertical gap={8}>
					<Text className={styles.titleLogs}>لاگ توزیع آب ({optimisticLogs.length})</Text>
					<MobileLogsTable logs={optimisticLogs} descriptionEditHours={descriptionEditHours} isPending={isPending} />
				</Flex>
			</Card>

			<div className={styles.footer}>
				{isIrrigating ? (
					<Flex align='center' gap={12} className={styles.footerContent}>
						<Text className={styles.timerText}>
							<TimerDisplay
								startedAt={startedAt}
								requiredWaterMs={parseTimeToMs(updatedRequiredWater)}
								remainingWaterMs={parseTimeToMs(updatedRemainingWater)}
							/>
						</Text>
						<Button type='default' className={styles.textBtn} onClick={() => setEndNoticeDrawer(true)} loading={isPending}>
							پایان آبیاری
						</Button>
					</Flex>
				) : (
					<Button type='primary' className={`button-modal ${styles.btnModal}`} block onClick={handleOpenStart} loading={isPending}>
						شروع آبیاری
					</Button>
				)}
			</div>

			<TimeStartPickerSheet
				isOpen={showStartDrawer}
				now={currentTime}
				onSubmit={handleTimeStartSelected}
				onClose={() => setShowStartDrawer(false)}
				loading={isPending}
			/>

			<TimeEndPickerSheet
				isOpen={showEndDrawer}
				title='ثبت زمان پایان آبیاری گروهی'
				subtitle='ساعت پایان آبیاری گروهی را مشخص کنید.'
				onSubmit={handleTimeEndSelected}
				onClose={() => setShowEndDrawer(false)}
				loading={isPending}
			/>

			<EndNoticeDrawer
				isOpen={endNoticeDrawer}
				onSubmit={() => {
					setEndNoticeDrawer(false)
					setShowEndDrawer(true)
				}}
				timer={
					<TimerDisplay
						startedAt={startedAt}
						requiredWaterMs={parseTimeToMs(updatedRequiredWater)}
						remainingWaterMs={parseTimeToMs(updatedRemainingWater)}
					/>
				}
				onClose={() => setEndNoticeDrawer(false)}
			/>

			<WarningModalInUse
				isOpen={isOpenWarning}
				onClose={() => setIsOpenWarning(false)}
				well={{
					land: ongoingLog?.land,
					irrigationStartedAt: ongoingLog?.startedAt,
					ongoingRequiredWater: updatedRequiredWater,
					ongoingRemainingWater: updatedRemainingWater,
				}}
				onSubmit={handleWarningModal}
			/>
		</div>
	)
}

export default LandGroupLogs
