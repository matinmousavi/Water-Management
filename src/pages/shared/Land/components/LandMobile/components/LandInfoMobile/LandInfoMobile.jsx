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

	const [isIrrigating, setIsIrrigating] = useState(false)
	const [elapsedTime, setElapsedTime] = useState(0)
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
				setElapsedTime(prev => prev + 1)
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
		return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`
	}

	const handleStop = () => {
		setEndNoticeDrawer(true)
		setIsIrrigating(false)
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

	const handleTimeStartSelected = time => {
		setStartTime(time)
		setIsIrrigating(true)
		setElapsedTime(0)
		setShowStartDrawer(false)
	}

	const handleTimeEndSelected = time => {
		setStartTime(time)
		setIsIrrigating(false)
		setElapsedTime(0)
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
		{ icon: iconContacts, title: 'نام زمین', value: data?.name },
		{ icon: iconPhone, title: 'شماره تماس', value: data?.owner?.mobile },
		{ icon: iconLocation, title: 'آدرس زمین', value: data?.location },
		{ icon: iconClock, title: 'آخرین زمان آبیاری', value: moment(data?.createAt).format('dddd jD jMMMM jYYYY') || '-' },
		{ icon: iconClock, title: 'زمان آبیاری بعدی', value: moment(data?.updatedAt).format('dddd jD jMMMM jYYYY') || '-' },
	]

	const columns = [
		{
			title: 'تاریخ',
			dataIndex: 'start',
			key: 'start',
			render: value => {
				const date = moment(value)
				return (
					<>
						<Typography.Text>{date.format('dddd')}</Typography.Text>
						<br />
						<Typography.Text>{date.format('jD jMMMM jYYYY')}</Typography.Text>
					</>
				)
			},
		},
		{
			title: 'ساعت شروع',
			dataIndex: 'start',
			key: 'start-time',
			render: value => moment(value).format('HH:mm'),
		},
		{
			title: 'مدت زمان آبیاری',
			dataIndex: 'timeIrrigation',
			key: 'timeIrrigation',
			render: value => moment(value).format('HH:mm'),
		},
		{
			title: 'توضیحات',
			dataIndex: 'notes',
			key: 'notes',
			render: value => {
				console.log('value is:', value)

				return (
					<Flex align='center' justify='center' gap={8}>
						<EyeOutlined onClick={() => setIsDescription(true)} style={{ color: '#1890ff' }} />
						<Modal
							rootClassName={styles.modalDescription}
							title={`توضیحات لاگ توزیع آب ${value.start}`}
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

	console.log(data)
	console.log('data api : ', api.data?.land)
	console.log(data.logs)
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
						<Text className={styles.timerText}>{formatTime(elapsedTime)}</Text>
						<Button type='default' style={{ borderColor: '#1677ff', color: '#1677ff', fontWeight: 500 }} onClick={handleStop}>
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
					<EndNoticeDrawer onSubmit={handleEndNotice} onClose={CancelTimeEnd} />
				</div>
			</Drawer>
		</div>
	)
}

export default LandInfoMobile
