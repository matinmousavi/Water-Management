import { Button, Card, Flex, Table, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
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

function uniqueGroupLogs(logs) {
	const map = new Map()
	logs.forEach(item => {
		const key = `${item.landGroup}_${item.startedAt}`
		if (!map.has(key)) {
			map.set(key, item)
		}
	})
	return Array.from(map.values())
}

const LogsGroup = ({ data }) => {
	const { groupId } = useParams()
	const api = useAPI()
	const apiTime = useAPI()
	apiTime.init('settings/irrigations')
	console.log(data)
	const descriptionEditHours = apiTime.data?.data?.descriptionEditHours?.time

	const [logs, setLogs] = useState([])
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [isIrrigating, setIsIrrigating] = useState(false)
	const [startedAt, setStartedAt] = useState(null)

	const getLocalStorageKey = () => `irrigation_group_start_${groupId}`

	useEffect(() => {
		if (data?.length && logs.length === 0) {
			setLogs(uniqueGroupLogs(data))
		}
	}, [data])

	useEffect(() => {
		const localStorageKey = getLocalStorageKey()

		if (!logs || logs.length === 0) {
			setIsIrrigating(false)
			setStartedAt(null)
			localStorage.removeItem(localStorageKey)
			return
		}

		const ongoingLog = logs.find(log => log.isOngoing === true)

		if (!ongoingLog) {
			setIsIrrigating(false)
			setStartedAt(null)
			localStorage.removeItem(localStorageKey)
			return
		}

		setIsIrrigating(true)

		let irrigationStartTime = localStorage.getItem(localStorageKey)

		if (!irrigationStartTime) {
			irrigationStartTime = Date.now()
			localStorage.setItem(localStorageKey, irrigationStartTime.toString())
		} else {
			console.log('Found existing start time in localStorage:', irrigationStartTime)
		}

		setStartedAt(parseInt(irrigationStartTime, 10))
	}, [logs, groupId])

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
				if (!record?.duration) return '--'

				const [h, m] = record?.duration.split(':').map(Number)
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

	// شروع آبیاری گروهی
	const handleTimeStartSelected = async selectedTime => {
		setShowStartDrawer(false)
		try {
			const now = dayjs()
			const time = dayjs(selectedTime, 'HH:mm')
			const combined = now.hour(time.hour()).minute(time.minute()).second(0).millisecond(0)

			const response = await api.post('irrigations', {
				landGroupId: data[0]?.landGroup,
				wellId: data[0]?.well,
				startTime: combined.toISOString(),
				isOngoing: true,
			})

			const startTime = Date.now().toString()
			const localStorageKey = getLocalStorageKey()
			localStorage.setItem(localStorageKey, startTime)

			const newLog = response?.irrigations[0]
			if (newLog) {
				setLogs(prevLogs => uniqueGroupLogs([newLog, ...prevLogs]))
			}
		} catch (error) {
			console.error('خطا در شروع آبیاری گروهی:', error)
		}
	}

	// پایان آبیاری گروهی
	const handleTimeEndSelected = async time => {
		setShowEndDrawer(false)

		try {
			const ongoing = logs.find(item => item.isOngoing === true && item.startedAt)

			if (!ongoing) {
				return
			}

			setLogs(prevLogs => {
				const updatedLogs = prevLogs.map(item => (item._id === ongoing._id ? { ...item, isOngoing: false } : item))
				return uniqueGroupLogs(updatedLogs)
			})

			const localStorageKey = getLocalStorageKey()
			localStorage.removeItem(localStorageKey)

			setIsIrrigating(false)
			setStartedAt(null)

			const now = dayjs()
			const timeMoment = dayjs(time, 'HH:mm')
			const combined = now.set('hour', timeMoment.hour()).set('minute', timeMoment.minute()).set('second', 0).set('millisecond', 0)

			const response = await api.patch(`irrigations/${ongoing._id}`, {
				endTime: combined.toISOString(),
				isOngoing: false,
			})

			const updatedLog = response?.irrigations[0]

			if (updatedLog) {
				setLogs(prevLogs => {
					const filtered = prevLogs.map(item => {
						console.log('Comparing log IDs for sync:', item._id, 'with', updatedLog._id)
						return item._id === updatedLog._id ? { ...updatedLog, isOngoing: false } : item
					})
					const uniqueFiltered = uniqueGroupLogs(filtered)
					return uniqueFiltered
				})
			}
		} catch (error) {
			console.error('خطا در پایان آبیاری گروهی:', error)
			const ongoing = logs.find(item => item.isOngoing === true && item.startedAt)
			if (ongoing) {
				setLogs(prevLogs => {
					return prevLogs.map(item => (item._id === ongoing._id ? { ...item, isOngoing: true } : item))
				})

				const localStorageKey = getLocalStorageKey()
				const savedStartTime = localStorage.getItem(localStorageKey)
				if (!savedStartTime) {
					localStorage.setItem(localStorageKey, Date.now().toString())
				}
				setIsIrrigating(true)
				setStartedAt(parseInt(savedStartTime || Date.now(), 10))
			}
		} finally {
			console.log('End irrigation process completed')
		}
	}

	const CancelTimeEnd = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(false)
	}

	const handleEndNotice = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(true)
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
				{isIrrigating ? (
					<Flex align='center'>
						<Text className={`${styles.timerText}`}>
							<TimerDisplay startedAt={startedAt} />
						</Text>
						<Button type='default' className={`${styles.textBtn}`} onClick={() => setEndNoticeDrawer(true)}>
							پایان آبیاری
						</Button>
					</Flex>
				) : (
					<Button type='primary' className={`button-modal ${styles.btnModal}`} block onClick={() => setShowStartDrawer(true)}>
						شروع آبیاری
					</Button>
				)}
			</div>

			{/* انتخاب زمان شروع */}
			<TimeStartPickerSheet isOpen={showStartDrawer} onSubmit={handleTimeStartSelected} onClose={() => setShowStartDrawer(false)} />

			{/* انتخاب زمان پایان */}
			<TimeEndPickerSheet
				isOpen={showEndDrawer}
				title='ثبت زمان پایان آبیاری گروهی'
				subtitle='ساعت پایان آبیاری گروهی را مشخص کنید.'
				onSubmit={handleTimeEndSelected}
				onClose={CancelTimeEnd}
			/>

			{/* تایید پایان آبیاری */}
			<EndNoticeDrawer isOpen={endNoticeDrawer} onSubmit={handleEndNotice} timer={<TimerDisplay startedAt={startedAt} />} onClose={CancelTimeEnd} />
		</div>
	)
}

export default LogsGroup
