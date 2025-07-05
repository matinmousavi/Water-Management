import { Card, Flex, Table, Typography, Button, Drawer } from 'antd'
import moment from 'moment-jalaali'
import styles from './LandInfoMobile.module.css'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
import iconContacts from '../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
import { useState, useEffect, useRef } from 'react'
import TimeStartPickerSheet from './components/TimeStartPickerSheet/TimeStartPickerSheet'
import TimeEndPickerSheet from './components/TimeEndPickerSheet/TimeEndPickerSheet'
import EndNoticeDrawer from './components/EndNoticeDrawer/EndNoticeDrawer'
import useAPI from '../../../../../../../hooks/useAPI'
import { useParams } from 'react-router'
import DescriptionModalCell from './components/DescriptionModalCell/DescriptionModalCell'
import { useIrrigationTimer } from '../../../../../../../contexts/IrrigationTimerContext'

const { Text } = Typography

const LandInfoMobile = ({ data }) => {
	const { landId } = useParams()
	const api = useAPI()
	api.init(`lands/${landId}`)

	const [logs, setLogs] = useState([])
	const [startTime, setStartTime] = useState(null)
	const [showStartDrawer, setShowStartDrawer] = useState(false)
	const [showEndDrawer, setShowEndDrawer] = useState(false)
	const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)

	const startY = useRef(0)
	const { elapsedTime, isIrrigating, startIrrigation, stopIrrigation, landID } = useIrrigationTimer()
	const isCurrentLandIrrigating = isIrrigating && landID === api.data?.land?._id

	useEffect(() => {
		if (api.data?.land?.logs) {
			setLogs(api.data.land.logs)
		}
	}, [api.data?.land?.logs])

	const refreshLogs = async () => {
		await api.init(`lands/${landId}`, false, true)
		if (api.data?.land?.logs) {
			setLogs(api.data.land.logs)
		}
	}

	const formatTime = seconds => {
		const hrs = Math.floor(seconds / 3600)
		const mins = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		return `  ${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
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
		startIrrigation(landId)
		setShowStartDrawer(false)

		try {
			// ترکیب تاریخ امروز با زمان انتخاب شده (فرض شده selectedTime فرمت 'HH:mm' داره)
			const now = moment()
			const time = moment(selectedTime, 'HH:mm')
			const combined = now.clone().hour(time.hour()).minute(time.minute()).second(0).millisecond(0)

			await api.post('irrigations', {
				landId,
				wellId: data?.wells[0]?._id,
				startTime: combined.toISOString(), // فرمت ISO کامل
				isOngoing: true,
			})
			await refreshLogs()
		} catch (error) {
			console.error('خطا در ارسال زمان شروع آبیاری:', error)
		}
	}

	const handleTimeEndSelected = async time => {
		setStartTime(time)
		stopIrrigation()
		setShowEndDrawer(false)

		try {
			const ongoing = api.data?.land?.logs?.find(item => item.isOngoing)
			if (!ongoing) return

			const now = moment()
			const timeMoment = moment(time, 'HH:mm')
			const combined = now.clone().hour(timeMoment.hour()).minute(timeMoment.minute()).second(0).millisecond(0)

			await api.patch(`irrigations/${ongoing._id}`, {
				endTime: combined.toISOString(),
			})
			await refreshLogs()
		} catch (error) {
			console.error('خطا در ثبت زمان پایان آبیاری:', error)
		}
	}

	const handleStop = () => {
		setEndNoticeDrawer(true)
		setStartTime(null)
	}

	const handleEndNotice = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(true)
		stopIrrigation(false)
	}

	const CancelTimeEnd = () => {
		setEndNoticeDrawer(false)
		setShowEndDrawer(false)
	}

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
			render: value => moment(value).format('dddd jD jMMMM jYYYY'),
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
			key: 'notes',
			render: record => <DescriptionModalCell record={record} />,
		},
	]

	return (
		<div className={styles.container}>
			<Flex gap={16} vertical>
				<Card className={styles.card}>
					<Flex vertical gap={8}>
						{listItems.map((item, idx) => (
							<Flex className={styles.itemCaar} key={idx} gap={10} align='center' justify='center'>
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
						<Text>لاگ توزیع آب ({logs?.length})</Text>
						<Table rowKey='_id' scroll={{ x: 'max-content' }} pagination={false} className={styles.table} dataSource={logs} columns={columns} />
					</Flex>
				</Card>
			</Flex>

			<div className={styles.footer}>
				{isCurrentLandIrrigating ? (
					<>
						<Text className={`${styles.timerText} ${elapsedTime <= 900 ? styles.timerDanger : ''}`}>{formatTime(elapsedTime)}</Text>
						<Button type='default' className={`${elapsedTime <= 900 ? styles.btnDanger : 'style-btn'}`} onClick={handleStop}>
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
