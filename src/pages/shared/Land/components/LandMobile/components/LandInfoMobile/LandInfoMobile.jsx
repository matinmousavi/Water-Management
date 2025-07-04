import { Card, Flex, Table, Typography, Button, Drawer, Modal } from 'antd'
import moment from 'moment-jalaali'
import styles from './LandInfoMobile.module.css'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
import iconContacts from '../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
import { EyeOutlined } from '@ant-design/icons'
import { useState, useEffect, useRef } from 'react'
import TimeStartPickerSheet from './components/TimeStartPickerSheet/TimeStartPickerSheet'
import TimeEndPickerSheet from './components/TimeEndPickerSheet/TimeEndPickerSheet'
import EndNoticeDrawer from './components/EndNoticeDrawer/EndNoticeDrawer'
import useAPI from '../../../../../../../hooks/useAPI'
import { useParams } from 'react-router'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const LandInfoMobile = ({ data }) => {
	const { Text } = Typography
	const { landId } = useParams()
	const api = useAPI()
	api.init(`lands/${landId}`)

	// console.log(data)

	const [isIrrigating, setIsIrrigating] = useState(false)
	const [elapsedTime, setElapsedTime] = useState(7200)
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
	const [startTime, setStartTime] = useState(null)
	const [isDescription, setIsDescription] = useState(false)
	const [isOngoing, setIsOngoing] = useState(false)
	const startY = useRef(0)

	useEffect(() => {
		let interval = null
		if (isIrrigating) {
			interval = setInterval(() => {
				setElapsedTime(prev => {
					if (prev <= 1) {
						clearInterval(interval)
						return 0
					}
					return prev - 1
				})
			}, 1000)
		} else {
			clearInterval(interval)
		}
		return () => clearInterval(interval)
	}, [isIrrigating])

	const formatTime = seconds => {
		const hrs = Math.floor(seconds / 3600)
		const mins = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		return `  ${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
	}

	const handleStop = () => {
		setEndNoticeDrawer(true)
		setStartTime(null)
	}

	const handleTouchStart = e => {
		startY.current = e.touches[0].clientY
	}

	const handleTouchMove = e => {
		const deltaY = e.touches[0].clientY - startY.current
		if (deltaY > 100) {
			setShowStartDrawer(false)
			setShowEndDrawer(false)
		}
	}

	const handleTimeStartSelected = async selectedTime => {
		setStartTime(selectedTime)
		setIsIrrigating(true)
		setElapsedTime(7200)
		setShowStartDrawer(false)

		const startDate = new Date(selectedTime.getFullYear(), selectedTime.getMonth(), selectedTime.getDate())

		const startTime = new Date(1970, 0, 1, selectedTime.getHours(), selectedTime.getMinutes(), 0)

		try {
			await api.post('irrigations', {
				landId,
				wellId: data?.wells[0]?._id,
				startDate,
				startTime,
			})
		} catch (error) {
			console.error('خطا در ارسال زمان شروع آبیاری:', error)
		}
	}

	const handleTimeEndSelected = time => {
		setStartTime(time)
		setIsIrrigating(false)
		setElapsedTime(7200)
		setShowEndDrawer(false)
	}

	const handleEndNotice = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(true)
		setIsIrrigating(false)
	}

	const CancelTimeEnd = () => {
		setEndNoticeDrawer(false)
		setIsIrrigating(true)
		setShowEndDrawer(false)
	}

	const listItems = [
		{ icon: iconContacts, title: 'نام زمین', value: data?.title },
		{ icon: iconPhone, title: 'شماره تماس', value: data?.owner?.mobile },
		{ icon: iconLocation, title: 'آدرس زمین', value: data?.location },
		{ icon: iconClock, title: 'زمان آبیاری بعدی', value: moment(data?.updatedAt).format('dddd jD jMMMM jYYYY') || '-' },
		{ icon: iconClock, title: 'آخرین زمان آبیاری', value: moment(data?.createAt).format('dddd jD jMMMM jYYYY') || '-' },
	]

	const columns = [
		{
			title: 'تاریخ',

			render: record => new Date(record.startedAt).toLocaleDateString('fa-IR'),
			// value => {
			// 	const date = moment(value)
			// 	return (
			// 		<>
			// 			<Typography.Text>{date.format('dddd')}</Typography.Text>
			// 			<br />
			// 			<Typography.Text>{date.format('jD jMMMM jYYYY')}</Typography.Text>
			// 		</>
			// 	)
			// },
		},
		{
			title: 'ساعت شروع',
			render: record => (record?.startedAt ? new Date(record?.startedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '--'),
		},
		{
			title: 'مدت زمان آبیاری',
			dataIndex: 'timeIrrigation',
			key: 'timeIrrigation',
			render: value => moment(value).format('HH:mm'),
		},
		{
			title: 'توضیحات',
			render: record => {
				return (
					<Flex align='center' justify='center' gap={8}>
						<EyeOutlined onClick={() => setIsDescription(true)} style={{ color: '#1890ff' }} />
						<Modal
							rootClassName={styles.modalDescription}
							title={`توضیحات لاگ توزیع آب ${
								record?.startedAt ? new Date(record?.startedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '--'
							}`}
							footer={false}
							centered
							open={isDescription}
							onCancel={() => setIsDescription(false)}
							okText={null}
						></Modal>
					</Flex>
				)
			},
		},
	]
	return (
		<div className={styles.container}>
			<Flex gap={16} vertical>
				<Card className={styles.card}>
					<Flex vertical gap={8}>
						{listItems.map((item, index) => (
							<Flex className={styles.itemCaar} key={index} gap={10} align='center' justify='center'>
								<Flex gap={8} className={styles.cardType}>
									<img src={item.icon} alt='icon' />
									<Text>{item.title}</Text>
								</Flex>
								<Flex className={styles.cardRole}>
									<Text>{item.value}</Text>
								</Flex>
							</Flex>
						))}
					</Flex>
				</Card>
				<Card>
					<Flex vertical gap={8}>
						<Text>لاگ توزیع آب ({data?.logs?.length})</Text>
						<Table scroll={{ x: 'max-content' }} pagination={false} className={styles.table} dataSource={api.data?.land?.logs} columns={columns} />
					</Flex>
				</Card>
			</Flex>

			{/* دکمه پایین */}
			<div className={styles.footer}>
				{isIrrigating ? (
					<>
						<Text className={`${styles.timerText} ${elapsedTime <= 900 ? styles.timerDanger : ''}`}>{formatTime(elapsedTime)}</Text>
						<Button type='default' className={` ${elapsedTime <= 900 ? styles.btnDanger : 'style-btn'}`} onClick={handleStop}>
							پایان آبیاری
						</Button>
					</>
				) : (
					<Button type='primary' block onClick={() => setShowStartDrawer(true)}>
						شروع آبیاری
					</Button>
				)}
			</div>

			<Drawer title={null} placement='bottom' height='auto' open={showStartDrawer} onClose={() => setShowStartDrawer(false)} closable={false}>
				<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<TimeStartPickerSheet onSubmit={handleTimeStartSelected} onClose={() => setShowStartDrawer(false)} />
				</div>
			</Drawer>
			<Drawer title={null} placement='bottom' height='auto' open={showEndDrawer} onClose={() => setShowEndDrawer(false)} closable={false}>
				<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<TimeEndPickerSheet onSubmit={handleTimeEndSelected} onClose={CancelTimeEnd} />
				</div>
			</Drawer>
			<Drawer title={null} placement='bottom' height='auto' open={endNoticeDrawer} onClose={() => setEndNoticeDrawer(false)} closable={false}>
				<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<EndNoticeDrawer onSubmit={handleEndNotice} time={formatTime(elapsedTime)} onClose={CancelTimeEnd} />
				</div>
			</Drawer>
		</div>
	)
}

export default LandInfoMobile
