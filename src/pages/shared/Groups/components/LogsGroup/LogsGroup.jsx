import { Button, Card, Flex, Table, Typography } from 'antd'
import moment from 'moment-jalaali'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../hooks/useAPI'

import styles from './LogsGroup.module.css'
import TimeStartPickerSheet from '../../../Land/components/LandMobile/components/LandLogsMobile/components/TimeStartPickerSheet/TimeStartPickerSheet'
import TimeEndPickerSheet from '../../../Land/components/LandMobile/components/LandLogsMobile/components/TimeEndPickerSheet/TimeEndPickerSheet'
import DescriptionModalCell from '../../../Land/components/LandMobile/components/LandLogsMobile/components/DescriptionModalCell/DescriptionModalCell'
import EndNoticeDrawer from '../../../Land/components/LandMobile/components/LandLogsMobile/components/EndNoticeDrawer/EndNoticeDrawer'
import TimerDisplay from '../../../../../components/TimerDisplay/TimerDisplay'

dayjs.extend(jalaliday)
dayjs.extend(customParseFormat)

const { Text } = Typography

const parseTimeToMs = str => {
	if (!str) return 0
	const [h, m] = str.split(':').map(Number)
	return (h * 60 * 60 + m * 60) * 1000
}

const LogsGroup = ({ wellId }) => {
	const { groupId } = useParams()
	const api = useAPI()
	const apiTime = useAPI()
	apiTime.init('settings/irrigations')

	const [logs, setLogs] = useState([])
	const [groupData, setGroupData] = useState(null)
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [isIrrigating, setIsIrrigating] = useState(false)
	const [startedAt, setStartedAt] = useState(null)
	const [currentTime, setCurrentTime] = useState(dayjs())

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
		setShowStartDrawer(true)
	}

	const columns = [
		{
			title: 'تاریخ',
			dataIndex: 'startedAt',
			key: 'date',
			render: value => (
				<p className={styles.date}>
					<span>{moment(value).format('dddd ')}</span>
					<span>{moment(value).format('jD jMMMM jYYYY ')}</span>
				</p>
			),
		},
		{
			title: 'ساعت شروع',
			dataIndex: 'startedAt',
			key: 'startTime',
			render: value => (value ? moment(value).format('HH:mm') : '--'),
		},
		{
			title: 'مدت زمان آبیاری',
			key: 'duration',
			render: (_, record) => {
				if (record?.isOngoing) return 'در حال آبیاری'
				const timeStr = record?.receivedWater || record?.duration
				if (!timeStr) return '--'
				const [h, m] = timeStr.split(':').map(Number)
				return h === 0 ? `${m} دقیقه` : `${h} ساعت${m > 0 ? ` و ${m} دقیقه` : ''}`
			},
		},
		{
			title: 'توضیحات',
			key: 'note',
			render: (_, record) => <DescriptionModalCell record={record} descriptionEditHours={descriptionEditHours} />,
		},
	]

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
			const ongoing = logs.find(l => l.isOngoing)
			if (!ongoing) return

			const t = dayjs(time, 'HH:mm')
			const combined = dayjs(ongoing.startedAt).hour(t.hour()).minute(t.minute()).second(0).millisecond(0)

			await api.patch(`irrigations/${ongoing._id}`, {
				endTime: combined.toISOString(),
				isOngoing: false,
			})

			await getLogsFromAPI()
			await fetchGroupData()

			setIsIrrigating(false)
			setStartedAt(null)
		} catch (e) {
			console.error('خطا در پایان آبیاری گروهی:', e.response?.data || e)
		}
	}

	return (
		<div className={styles.container}>
			<Card>
				<Flex vertical gap={8}>
					<Text className={styles.titleLogs}>لاگ توزیع آب ({logs?.length})</Text>
					<Table
						rowKey='_id'
						bordered
						scroll={{ x: 'max-content' }}
						pagination={false}
						className={styles.table}
						dataSource={logs}
						columns={columns}
						loading={api.isLoading}
					/>
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
		</div>
	)
}

export default LogsGroup
