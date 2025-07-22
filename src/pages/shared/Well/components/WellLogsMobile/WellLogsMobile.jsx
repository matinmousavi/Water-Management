import { Card, Flex, Typography } from 'antd'
import styles from './WellLogsMobile.module.css'
import iconTree from '../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../assets/icons/ClockCircleOutlined.svg'
import moment from 'moment-jalaali'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const { Text } = Typography

const TWO_HOURS_IN_SECONDS = 2 * 60 * 60

const formatTime = seconds => {
	const safeSeconds = Math.max(0, seconds)
	const hrs = Math.floor(safeSeconds / 3600)
	const mins = Math.floor((safeSeconds % 3600) / 60)
	const secs = safeSeconds % 60
	return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
}

const getRemainingTimeFromLocalStorage = landId => {
	if (!landId) return 0

	const localStorageKey = `irrigation_start_${landId}`
	const irrigationStartTime = localStorage.getItem(localStorageKey)

	if (!irrigationStartTime) return 0

	const startTime = parseInt(irrigationStartTime, 10)
	const now = Date.now()
	const elapsedSeconds = Math.floor((now - startTime) / 1000)
	const remaining = TWO_HOURS_IN_SECONDS - elapsedSeconds

	return Math.abs(remaining)
}

const WellLogsMobile = ({ data }) => {
	const isThisLogOngoing = data?.isOngoing
	const landId = data?.land?._id

	const [remainingTime, setRemainingTime] = useState(() => (isThisLogOngoing ? getRemainingTimeFromLocalStorage(landId) : 0))

	useEffect(() => {
		if (!isThisLogOngoing || !landId) return

		const updateTimer = () => {
			setRemainingTime(getRemainingTimeFromLocalStorage(landId))
		}

		updateTimer()
		const interval = setInterval(updateTimer, 1000)

		return () => clearInterval(interval)
	}, [landId, isThisLogOngoing])

	return (
		<Card>
			<Flex vertical gap={24}>
				<Flex gap={10} align='start'>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconTree} alt='icon tree' />
						<Text className={styles.label}>نام زمین</Text>
					</Flex>
					<Flex className={styles.cardRole}>
						{data?.land ? (
							<Link to={`/lands/${data?.land?._id}`} className={styles.land_name}>
								{data?.land?.title}
							</Link>
						) : (
							<Text>-</Text>
						)}
					</Flex>
				</Flex>

				<Flex gap={10}>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconClock} alt='icon clock' />
						<Text className={styles.label}>آخرین زمان آبیاری</Text>
					</Flex>
					<Flex className={styles.cardRole}>
						<Text className={styles.text_irrigation}>
							{isThisLogOngoing ? (
								<span className={`${styles.timerText} ${remainingTime <= 900 ? styles.timerDanger : ''}`}>{formatTime(remainingTime)}</span>
							) : (
								moment(data?.endedAt).format('HH:mm - jYYYY/jMM/jDD') || '-'
							)}
						</Text>
					</Flex>
				</Flex>

				<Flex gap={10}>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconClock} alt='icon clock' />
						<Text className={styles.label}>زمان آبیاری بعدی</Text>
					</Flex>
					<Flex className={styles.cardRole}>
						<Text className={styles.text_irrigation}>{moment(data?.updatedAt).format('HH:mm - jYYYY/jMM/jDD') || '-'}</Text>
					</Flex>
				</Flex>
			</Flex>
		</Card>
	)
}

export default WellLogsMobile
