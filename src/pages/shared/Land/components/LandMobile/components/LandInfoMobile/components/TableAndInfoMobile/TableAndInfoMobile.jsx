import styles from './TableAndInfoMobile.module.css'
import { Flex, Button, Typography, Card, Table } from 'antd'
import moment from 'moment-jalaali'
import iconClock from '../../../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconLocation from '../../../../../../../../../assets/icons/EnvironmentOutlined.svg'
import iconContacts from '../../../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../../../assets/icons/PhoneOutlined.svg'
import DescriptionModalCell from '../DescriptionModalCell/DescriptionModalCell'

const { Text } = Typography

const TableAndInfoMobile = ({ data, logs, isIrrigating, elapsedTime, time, handleStop, onStartClick }) => {
	const isCurrentLandIrrigating = isIrrigating && logs.some(log => log.isOngoing && log.startedAt)

	const listItems = [
		{ icon: iconContacts, title: 'نام زمین', value: data?.title },
		{ icon: iconPhone, title: 'شماره تماس', value: data?.owner?.mobile },
		{ icon: iconLocation, title: 'آدرس زمین', value: data?.location },
		{ icon: iconClock, title: 'زمان آبیاری بعدی', value: moment(data?.updatedAt).format('dddd jD jMMMM jYYYY') || '-' },
		{ icon: iconClock, title: 'آخرین زمان آبیاری', value: moment(data?.createdAt).format('dddd jD jMMMM jYYYY') || '-' },
	]

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
			<Flex gap={20} vertical>
				<Card className={styles.card}>
					<Flex vertical gap={8}>
						{listItems.map((item, idx) => (
							<Flex className={styles.itemCard} key={idx} gap={10} align='center' justify='center'>
								<Flex gap={8} className={styles.cardType}>
									<img src={item.icon} alt='icon' />
									<Text className={styles.label}>{item.title}</Text>
								</Flex>
								<Flex className={styles.cardRole}>
									<Text className={styles.value}>{item.value}</Text>
								</Flex>
							</Flex>
						))}
					</Flex>
				</Card>

				<Card>
					<Flex vertical gap={8}>
						<Text>لاگ توزیع آب ({logs?.length})</Text>
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
			</Flex>

			<div className={styles.footer}>
				{isCurrentLandIrrigating ? (
					<>
						<Text className={`${styles.timerText} ${elapsedTime <= 900 ? styles.timerDanger : ''}`}>{time}</Text>
						<Button type='default' className={`${elapsedTime <= 900 ? styles.btnDanger : 'style-btn'}`} onClick={handleStop}>
							پایان آبیاری
						</Button>
					</>
				) : (
					<Button type='primary' block onClick={onStartClick}>
						شروع آبیاری
					</Button>
				)}
			</div>
		</>
	)
}

export default TableAndInfoMobile
