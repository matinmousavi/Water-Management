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

const uniqueGroupLogs = logs => {
	const map = new Map()
	logs.forEach(item => {
		const key = `${item.landGroupId || item.landGroup}_${item.startedAt}`
		if (!map.has(key)) map.set(key, item)
	})
	return Array.from(map.values())
}

const parseTimeToMs = str => {
	if (!str) return 0
	const [h, m] = str.split(':').map(Number)
	return (h * 60 * 60 + m * 60) * 1000
}

const LogsGroup = ({ data, wellId, group }) => {
	const { groupId } = useParams()
	const api = useAPI()
	const apiTime = useAPI()
	apiTime.init('settings/irrigations')
	const descriptionEditHours = apiTime.data?.data?.descriptionEditHours?.time

	const [logs, setLogs] = useState([])
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [isIrrigating, setIsIrrigating] = useState(false)
	const [startedAt, setStartedAt] = useState(null)
	const [durationMs, setDurationMs] = useState(null)

	const getLocalStorageKey = () => `irrigation_group_start_${groupId}`

	useEffect(() => {
		if (data?.length && logs.length === 0) {
			setLogs(uniqueGroupLogs(data))
		}
	}, [data])

	useEffect(() => {
		if (!logs || logs.length === 0) {
			setIsIrrigating(false)
			setStartedAt(null)
			setDurationMs(null)
			localStorage.removeItem(getLocalStorageKey())
			return
		}

		const ongoingLog = logs.find(log => log.isOngoing)
		if (!ongoingLog) {
			setIsIrrigating(false)
			setStartedAt(null)
			setDurationMs(null)
			localStorage.removeItem(getLocalStorageKey())
			return
		}

		setIsIrrigating(true)
		const startMs = dayjs(ongoingLog.startedAt).valueOf()
		localStorage.setItem(getLocalStorageKey(), String(startMs))
		setStartedAt(startMs)

		const duration = ongoingLog.receivedWater
			? parseTimeToMs(ongoingLog.receivedWater)
			: group?.remainingWater
			? parseTimeToMs(group.remainingWater)
			: 2 * 60 * 60 * 1000
		setDurationMs(duration)
	}, [logs, groupId, group])

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
			render: (text, record) => {
				if (record?.isOngoing) return 'در حال آبیاری'

				const timeStr = record?.receivedWater || record?.duration
				if (!timeStr) return '--'

				const [h, m] = timeStr.split(':').map(Number)
				return h === 0 ? `${m} دقیقه` : `${h} ساعت${m > 0 ? ` و ${m} دقیقه` : ''}`
			},
		},
		{
			title: 'توضیحات',
			dataIndex: 'note',
			key: 'note',
			render: record => <DescriptionModalCell record={record} descriptionEditHours={descriptionEditHours} />,
		},
	]

	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)
		try {
			const now = dayjs()
			const t = dayjs(selectedTime, 'HH:mm')
			const combined = now.hour(t.hour()).minute(t.minute()).second(0).millisecond(0)

			const response = await api.post('irrigations', {
				landGroupId: groupId,
				wellId,
				startTime: combined.toISOString(),
				isOngoing: true,
			})

			const newLog = response?.irrigations[0]
			if (newLog) setLogs(prev => uniqueGroupLogs([newLog, ...prev]))
		} catch (e) {
			console.error('خطا در شروع آبیاری گروهی:', e)
		}
	}
	console.log(logs)

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

			setLogs(prev => uniqueGroupLogs(prev.map(l => (l._id === ongoing._id ? { ...l, isOngoing: false, endTime: combined.toISOString() } : l))))

			setIsIrrigating(false)
			setStartedAt(null)
			setDurationMs(null)
			localStorage.removeItem(getLocalStorageKey())
		} catch (e) {
			console.error('خطا در پایان آبیاری گروهی:', e)
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
					/>
				</Flex>
			</Card>

			<div className={styles.footer}>
				{isIrrigating && startedAt ? (
					<Flex align='center' gap={12} className={styles.footerContent}>
						<Text className={styles.timerText}>
							<TimerDisplay startedAt={startedAt} durationMs={durationMs} />
						</Text>
						<Button type='default' className={styles.textBtn} onClick={() => setEndNoticeDrawer(true)}>
							پایان آبیاری
						</Button>
					</Flex>
				) : (
					<Button type='primary' className={`button-modal ${styles.btnModal}`} block onClick={() => setShowStartDrawer(true)}>
						شروع آبیاری
					</Button>
				)}
			</div>

			<TimeStartPickerSheet isOpen={showStartDrawer} onSubmit={handleTimeStartSelected} onClose={() => setShowStartDrawer(false)} />
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
				timer={<TimerDisplay startedAt={startedAt} durationMs={durationMs} />}
				onClose={() => setEndNoticeDrawer(false)}
			/>
		</div>
	)
}

export default LogsGroup
