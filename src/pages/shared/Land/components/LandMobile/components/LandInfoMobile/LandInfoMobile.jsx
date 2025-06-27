// import { Card, Flex, Table, Typography, Button } from 'antd'
// import moment from 'moment-jalaali'
// import styles from './LandInfoMobile.module.css'
// import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
// import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
// import iconContacts from '../../../../../../../assets/icons/ContactsOutlined.svg'
// import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
// import { EyeOutlined } from '@ant-design/icons'
// import { useState, useEffect } from 'react'

// moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

// const LandInfoMobile = ({ data }) => {
// 	const { Text } = Typography

// 	const [isIrrigating, setIsIrrigating] = useState(false)
// 	const [elapsedTime, setElapsedTime] = useState(0)

// 	console.log(data)

// 	// Handle Timer
// 	useEffect(() => {
// 		let interval = null
// 		if (isIrrigating) {
// 			interval = setInterval(() => {
// 				setElapsedTime(prev => prev + 1)
// 			}, 1000)
// 		} else {
// 			clearInterval(interval)
// 		}
// 		return () => clearInterval(interval)
// 	}, [isIrrigating])

// 	const formatTime = seconds => {
// 		const hrs = Math.floor(seconds / 3600)
// 		const mins = Math.floor((seconds % 3600) / 60)
// 		const secs = seconds % 60
// 		return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`
// 	}

// 	const handleStart = () => {
// 		setIsIrrigating(true)
// 		setElapsedTime(0)
// 	}

// 	const handleStop = () => {
// 		setIsIrrigating(false)
// 	}

// 	const listItems = [
// 		{
// 			icon: iconContacts,
// 			title: 'نام زمین',
// 			value: data?.name,
// 		},
// 		{
// 			icon: iconPhone,
// 			title: 'شماره تماس',
// 			value: data?.owner?.mobile,
// 		},
// 		{
// 			icon: iconLocation,
// 			title: 'آدرس زمین',
// 			value: data?.location,
// 		},
// 		{
// 			icon: iconClock,
// 			title: 'آخرین زمان آبیاری',
// 			value: moment(data?.createAt).format('dddd jD jMMMM jYYYY') || '-',
// 		},
// 		{
// 			icon: iconClock,
// 			title: 'زمان آبیاری بعدی',
// 			value: moment(data?.updatedAt).format('dddd jD jMMMM jYYYY') || '-',
// 		},
// 	]

// 	const columns = [
// 		{
// 			title: 'تاریخ',
// 			dataIndex: 'start',
// 			key: 'start',
// 		},
// 		{
// 			title: 'ساعت شروع',
// 			dataIndex: 'start',
// 			key: 'start',
// 		},
// 		{
// 			title: 'مدت زمان آبیاری',
// 			dataIndex: 'timeIrrigation',
// 			key: 'timeIrrigation',
// 		},
// 		{
// 			title: 'توضیحات',
// 			dataIndex: 'description',
// 			key: 'description',
// 			render: () => (
// 				<Flex align='center' justify='center' gap={8}>
// 					<EyeOutlined style={{ color: '#1890ff' }} />
// 				</Flex>
// 			),
// 		},
// 	]

// 	return (
// 		<div className={styles.container}>
// 			<Flex vertical>
// 				<Card className={styles.card}>
// 					<Flex vertical gap={8}>
// 						{listItems.map((item, index) => (
// 							<Flex className={styles.itemCaar} key={index} gap={10} align='center' justify='center'>
// 								<Flex gap={8} className={styles.cardType}>
// 									<img src={item.icon} alt='icon' />
// 									<Text>{item.title}</Text>
// 								</Flex>
// 								<Flex className={styles.cardRole}>
// 									<Text>{item.value}</Text>
// 								</Flex>
// 							</Flex>
// 						))}
// 					</Flex>
// 				</Card>
// 				<Card>
// 					<Text>لاگ توزیع آب ({data.length})</Text>
// 					<Table pagination={false} className={styles.table} dataSource={data.logs} columns={columns} />
// 				</Card>
// 			</Flex>

// 			{/* نوار پایین */}
// 			<div className={styles.footer}>
// 				{isIrrigating ? (
// 					<>
// 						<Text className={styles.timerText}>{formatTime(elapsedTime)}</Text>
// 						<Button
// 							type='default'
// 							style={{
// 								borderColor: '#1677ff',
// 								color: '#1677ff',
// 								fontWeight: 500,
// 							}}
// 							onClick={handleStop}
// 						>
// 							پایان آبیاری
// 						</Button>
// 					</>
// 				) : (
// 					<Button type='primary' block onClick={handleStart}>
// 						شروع آبیاری
// 					</Button>
// 				)}
// 			</div>
// 		</div>
// 	)
// }

// export default LandInfoMobile

import { Card, Flex, Table, Typography, Button, Drawer } from 'antd'
import moment from 'moment-jalaali'
import styles from './LandInfoMobile.module.css'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
import iconContacts from '../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
import { EyeOutlined } from '@ant-design/icons'
import { useState, useEffect, useRef } from 'react'
import TimePickerSheet from './components/TimePickerSheet'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const LandInfoMobile = ({ data }) => {
	const { Text } = Typography

	const [isIrrigating, setIsIrrigating] = useState(false)
	const [elapsedTime, setElapsedTime] = useState(0)
	const [showDrawer, setShowDrawer] = useState(false)
	const [startTime, setStartTime] = useState(null)

	const startY = useRef(0)

	// تایمر آبیاری
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
		setIsIrrigating(false)
		setStartTime(null)
	}

	const handleTouchStart = e => {
		startY.current = e.touches[0].clientY
	}

	const handleTouchMove = e => {
		const deltaY = e.touches[0].clientY - startY.current
		if (deltaY > 100) setShowDrawer(false)
	}

	const handleTimeSelected = time => {
		setStartTime(time)
		setIsIrrigating(true)
		setElapsedTime(0)
		setShowDrawer(false)
	}

	const listItems = [
		{ icon: iconContacts, title: 'نام زمین', value: data?.name },
		{ icon: iconPhone, title: 'شماره تماس', value: data?.owner?.mobile },
		{ icon: iconLocation, title: 'آدرس زمین', value: data?.location },
		{ icon: iconClock, title: 'آخرین زمان آبیاری', value: moment(data?.createAt).format('dddd jD jMMMM jYYYY') || '-' },
		{ icon: iconClock, title: 'زمان آبیاری بعدی', value: moment(data?.updatedAt).format('dddd jD jMMMM jYYYY') || '-' },
	]

	const columns = [
		{ title: 'تاریخ', dataIndex: 'start', key: 'start' },
		{ title: 'ساعت شروع', dataIndex: 'start', key: 'start' },
		{ title: 'مدت زمان آبیاری', dataIndex: 'timeIrrigation', key: 'timeIrrigation' },
		{
			title: 'توضیحات',
			dataIndex: 'description',
			key: 'description',
			render: () => (
				<Flex align='center' justify='center' gap={8}>
					<EyeOutlined style={{ color: '#1890ff' }} />
				</Flex>
			),
		},
	]

	return (
		<div className={styles.container}>
			<Flex vertical>
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
					<Text>لاگ توزیع آب ({data?.logs?.length})</Text>
					<Table pagination={false} className={styles.table} dataSource={data.logs} columns={columns} />
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
					<Button type='primary' block onClick={() => setShowDrawer(true)}>
						شروع آبیاری
					</Button>
				)}
			</div>

			<Drawer title={null} placement='bottom' height='auto' open={showDrawer} onClose={() => setShowDrawer(false)} closable={false}>
				<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<TimePickerSheet onSubmit={handleTimeSelected} onClose={() => setShowDrawer(false)} />
				</div>
			</Drawer>
		</div>
	)
}

export default LandInfoMobile
