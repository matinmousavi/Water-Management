import { Flex, Button, Typography, Card, Table } from 'antd'
import moment from 'moment-jalaali'

import DescriptionModalCell from '../DescriptionModalCell/DescriptionModalCell'

import styles from './TableLogsMobile.module.css'

const { Text } = Typography

const TableLogsMobile = ({ data, logs, isIrrigating, timer, handleStop, onStartClick }) => {
	const isCurrentLandIrrigating = isIrrigating && logs.some(log => log.isOngoing && log.startedAt)

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
			render: record => <DescriptionModalCell record={record} />,
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
				{isCurrentLandIrrigating ? (
					<>
						<Text className={`${styles.timerText}`}>{timer}</Text>
						<Button type='default' className={`${styles.textBtn}`} onClick={handleStop}>
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
