import { Flex, Button, Typography, Card, Table } from 'antd'
import moment from 'moment-jalaali'
import { useEffect, useRef, useState } from 'react'

import DescriptionModalCell from '../DescriptionModalCell/DescriptionModalCell'

import styles from './TableLogsMobile.module.css'
import useAPI from '../../../../../../../../../hooks/useAPI'

const { Text } = Typography

const TableLogsMobile = ({ data, logs, isIrrigating, handleStop, onStartClick }) => {
	const isCurrentLandIrrigating = isIrrigating && logs.some(log => log.isOngoing && log.startedAt)

	const apiTime = useAPI()
	apiTime.init('settings/irrigations')

	const descriptionEditHours = apiTime.data?.data?.descriptionEditHours?.time

	// ------------------ ⏳ تایمر کاهشی ------------------
	const parseRemainingWater = timeStr => {
		if (!timeStr) return 0
		const [h, m] = timeStr.split(':').map(Number)
		return (h * 60 + m) * 60 // تبدیل دقیقه به ثانیه
	}

	const formatTime = totalSeconds => {
		const absSec = Math.abs(totalSeconds)
		const hrs = Math.floor(absSec / 3600)
		const mins = Math.floor((absSec % 3600) / 60)
		const secs = absSec % 60
		return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`
	}

	const ongoingLog = logs.find(log => log.isOngoing)
	const initialSeconds = ongoingLog ? parseRemainingWater(ongoingLog.remainingWater) : 0
	const [timeLeft, setTimeLeft] = useState(initialSeconds)
	const intervalRef = useRef(null)

	useEffect(() => {
		if (!isCurrentLandIrrigating || !ongoingLog) return

		let seconds = parseRemainingWater(ongoingLog.remainingWater)
		setTimeLeft(seconds)

		const update = () => {
			seconds -= 1
			setTimeLeft(seconds)
		}

		clearInterval(intervalRef.current)
		intervalRef.current = setInterval(update, 1000)

		return () => clearInterval(intervalRef.current)
	}, [isCurrentLandIrrigating, ongoingLog])

	// ------------------ جدول ------------------
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
				if (record.isOngoing) return 'در حال آبیاری'
				if (!record.duration) return '--'

				const [h, m] = record.duration.split(':').map(Number)
				return h === 0 ? `${m} دقیقه` : `${h} ساعت${m > 0 ? ` و ${m} دقیقه` : ''}`
			},
		},
		{
			title: 'توضیحات',
			key: 'note',
			render: record => <DescriptionModalCell record={record} descriptionEditHours={descriptionEditHours} />,
		},
	]

	return (
		<>
			<Card>
				<Flex vertical gap={8}>
					<Text className={styles.titleLogs}>لاگ توزیع آب ({logs?.length})</Text>
					<Table
						size='middle'
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
				{isCurrentLandIrrigating && ongoingLog ? (
					<>
						<Text className={styles.timerText} style={{ color: 'green' }}>
							{formatTime(timeLeft)}
						</Text>
						<Button type='default' onClick={handleStop}>
							پایان آبیاری
						</Button>
					</>
				) : (
					<Button type='primary' className={`button-modal ${styles.btnModal}`} block onClick={onStartClick}>
						شروع آبیاری
					</Button>
				)}
			</div>
		</>
	)
}

export default TableLogsMobile
