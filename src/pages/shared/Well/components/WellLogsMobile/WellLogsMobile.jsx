import { Card, Flex, Typography } from 'antd'
import styles from './WellLogsMobile.module.css'
import iconTree from '../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../assets/icons/ClockCircleOutlined.svg'
import moment from 'moment-jalaali'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const { Text } = Typography

const formatTime = seconds => {
	const safeSeconds = Math.max(0, seconds)
	const hrs = Math.floor(safeSeconds / 3600)
	const mins = Math.floor((safeSeconds % 3600) / 60)
	const secs = safeSeconds % 60
	return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
}

const getRemainingTime = startedAt => {
	if (!startedAt) return 0

	const started = new Date(startedAt).getTime()
	const now = Date.now()
	const elapsedSeconds = Math.floor((now - started) / 1000)
	const totalSeconds = 2 * 3600
	const remaining = totalSeconds - elapsedSeconds
	return remaining > 0 ? remaining : 0
}

const WellLogsMobile = ({ data }) => {
	const isThisLogOngoing = data?.isOngoing
	const [remainingTime, setRemainingTime] = useState(() => (isThisLogOngoing ? getRemainingTime(data?.startedAt) : 0))

	useEffect(() => {
		if (!isThisLogOngoing) return

		const interval = setInterval(() => {
			setRemainingTime(getRemainingTime(data?.startedAt))
		}, 1000)

		return () => clearInterval(interval)
	}, [data?.startedAt, isThisLogOngoing])

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
