import { Button, Card, Flex, Typography } from 'antd'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../hooks/useAPI'

import styles from './LandGroupLogs.module.css'
import TimeEndPickerSheet from '../../../../../components/responsive/mobile/TimeEndPickerSheet/TimeEndPickerSheet'
import TimeStartPickerSheet from '../../../../../components/responsive/mobile/TimeStartPickerSheet/TimeStartPickerSheet'
import EndNoticeDrawer from '../../../../../components/responsive/mobile/EndNoticeDrawer/EndNoticeDrawer'
import MobileLogsTable from '../../../../../components/responsive/mobile/MobileLogsTable/MobileLogsTable'
import TimerDisplay from '../../../../../components/common/TimerDisplay/TimerDisplay'
import WarningModalInUse from '../../../../../components/responsive/mobile/WarningModalInUse/WarningModalInUse'

dayjs.extend(jalaliday)
dayjs.extend(customParseFormat)

const { Text } = Typography

const parseTimeToMs = str => {
	if (!str) return 0
	const [h, m] = str.split(':').map(Number)
	return (h * 60 * 60 + m * 60) * 1000
}

const LandGroupLogs = ({ initialLogs }) => {
	const { wellId, groupId } = useParams()
	const api = useAPI()
	const apiTime = useAPI()
	const apiWell = useAPI()
	const [logs, setLogs] = useState(initialLogs || [])
	const [groupData, setGroupData] = useState(null)
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [isIrrigating, setIsIrrigating] = useState(false)
	const [startedAt, setStartedAt] = useState(null)
	const [currentTime, setCurrentTime] = useState(dayjs())
	const [isOpenWarning, setIsOpenWarning] = useState(false)

	const descriptionEditHours = apiTime.data?.data?.descriptionEditHours?.time

	const fetchGroupData = async () => {
		try {
			const response = await api.get(`wells/${wellId}/land-groups/${groupId}`)
			setGroupData(response)
		} catch (e) {
			console.error('خطا در دریافت اطلاعات گروه:', e.response?.data || e)
		}
	}

	const getLogsFromAPI = async () => {
		try {
			const response = await api.get(`irrigations?landGroup=${groupId}&well=${wellId}`)
			setLogs(response?.irrigations || [])

			const ongoingLog = response?.irrigations?.find(log => log.isOngoing)
			if (ongoingLog) {
				setIsIrrigating(true)
				setStartedAt(ongoingLog.startedAt)
			} else {
				setIsIrrigating(false)
				setStartedAt(null)
			}
		} catch (e) {
			console.error('خطا در دریافت لاگ‌ها:', e.response?.data || e)
		}
	}

	useEffect(() => {
		getLogsFromAPI()
		fetchGroupData()
	}, [groupId, wellId])

	const handleOpenStart = () => {
		setCurrentTime(dayjs())
		const logss = apiWell?.data?.well?.logs
		const ongoingLog = logss?.find(log => log.isOngoing)
		if (ongoingLog) {
			setIsOpenWarning(true)
		} else {
			setShowStartDrawer(true)
		}
	}

	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)
		try {
			const t = dayjs(selectedTime, 'HH:mm')
			const combined = dayjs().startOf('day').hour(t.hour()).minute(t.minute()).second(0).millisecond(0)

			const response = await api.post('irrigations', {
				landGroupId: groupId,
				wellId,
				startTime: combined.toISOString(),
				isOngoing: true,
			})

			const newLog = response?.irrigation
			if (newLog) {
				setStartedAt(newLog.startedAt)
				setIsIrrigating(true)
				setLogs(prev => [newLog, ...prev])
			}
		} catch (e) {
			console.error('خطا در شروع آبیاری گروهی:', e.response?.data || e)
		}
	}

	const handleTimeEndSelected = async time => {
		setShowEndDrawer(false)
		try {
			const ongoing = apiWell.data?.well?.logs?.find(l => l.isOngoing)

			if (!ongoing) {
				const groupOngoing = logs.find(item => item.isOngoing && item.startedAt)
				if (!groupOngoing) return

				const t = dayjs(time, 'HH:mm')
				const combinedGroup = dayjs(groupOngoing.startedAt).hour(t.hour()).minute(t.minute()).second(0).millisecond(0)

				await api.patch(`irrigations/${groupOngoing._id}`, {
					endTime: combinedGroup.toISOString(),
				})
				await getLogsFromAPI()
				await fetchGroupData()

				setIsIrrigating(false)
				setStartedAt(null)
				return
			}

			const t = dayjs(time, 'HH:mm')
			const combined = dayjs(ongoing.startedAt).hour(t.hour()).minute(t.minute()).second(0).millisecond(0)

			await api.patch(`irrigations/${ongoing._id}`, {
				endTime: combined.toISOString(),
			})

			await getLogsFromAPI()
			await fetchGroupData()

			setIsIrrigating(false)
			setStartedAt(null)
		} catch (e) {
			console.error('خطا در پایان آبیاری گروهی:', e.response?.data || e)
		}
	}

	const ongoingLog = apiWell.data?.well?.logs?.find(log => log.isOngoing)
	const handleWarningModal = () => {
		setIsOpenWarning(false)
		setShowEndDrawer(true)
	}

	return (
		<div className={styles.container}>
			<Card>
				<Flex vertical gap={8}>
					<Text className={styles.titleLogs}>لاگ توزیع آب ({logs?.length})</Text>
					<MobileLogsTable logs={logs} descriptionEditHours={descriptionEditHours} />
				</Flex>
			</Card>

			<div className={styles.footer}>
				{isIrrigating ? (
					<Flex align='center' gap={12} className={styles.footerContent}>
						<Text className={styles.timerText}>
							<TimerDisplay
								startedAt={startedAt}
								requiredWaterMs={parseTimeToMs(groupData?.requiredWater)}
								remainingWaterMs={parseTimeToMs(groupData?.remainingWater)}
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
				title='ثبت زمان پایان آبیاری گروهی'
				subtitle='ساعت پایان آبیاری گروهی را مشخص کنید.'
				onSubmit={handleTimeEndSelected}
				onClose={() => setShowEndDrawer(false)}
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
						requiredWaterMs={parseTimeToMs(groupData?.requiredWater)}
						remainingWaterMs={parseTimeToMs(groupData?.remainingWater)}
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
					ongoingRequiredWater: groupData?.requiredWater,
					ongoingRemainingWater: groupData?.remainingWater,
				}}
				onSubmit={handleWarningModal}
			/>
		</div>
	)
}

export default LandGroupLogs
