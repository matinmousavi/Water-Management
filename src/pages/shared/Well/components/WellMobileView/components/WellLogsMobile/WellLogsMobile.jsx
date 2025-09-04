import { Card, Flex, Typography } from 'antd'
import moment from 'moment-jalaali'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'

import styles from './WellLogsMobile.module.css'

import iconTree from '../../../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'

import ProgressBar from '../../../../../../../components/ProgressBar/ProgressBar'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const { Text } = Typography

const WellLogsMobile = ({ wellId, data }) => {
	const isThisLogOngoing = data?.irrigationInProgress

	const isOff = data?.type === 'off'
	const landId = data?.landId

	const [countdown, setCountdown] = useState(null)
	const [isOver, setIsOver] = useState(false)

	useEffect(() => {
		if (!isThisLogOngoing || !data?.irrigationStartedAt || !data?.remainingWater) return

		const [h, m] = data.remainingWater.split(':').map(Number)
		const remainingMs = h * 3600000 + m * 60000

		const start = new Date(data.irrigationStartedAt).getTime()
		const end = start + remainingMs

		const interval = setInterval(() => {
			const now = Date.now()
			const diff = end - now

			const formatTime = ms => {
				const totalSeconds = Math.floor(ms / 1000)
				const hours = Math.floor(totalSeconds / 3600)
				const minutes = Math.floor((totalSeconds % 3600) / 60)
				const seconds = totalSeconds % 60
				return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
			}

			if (diff >= 0) {
				setCountdown(formatTime(diff))
				setIsOver(false)
			} else {
				const over = Math.abs(diff)
				setCountdown(`-${formatTime(over)}`)
				setIsOver(true)
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [isThisLogOngoing, data?.irrigationStartedAt, data?.remainingWater])

	let cardClass = ''
	if (isOff) {
		cardClass = styles.offCard
	} else if (isThisLogOngoing) {
		cardClass = isOver ? styles.borderCardDanger : styles.borderCard
	}

	const totalMsInCycle = data?.totalSchedulesInCycle * 60 * 60 * 1000 || 0
	const receivedMsInCycle = (() => {
		if (!data?.receivedWaterInCycle) return 0
		const [h, m] = data.receivedWaterInCycle.split(':').map(Number)
		return h * 3600000 + m * 60000
	})()
	const progressValue = totalMsInCycle ? (receivedMsInCycle / totalMsInCycle) * 100 : 0
	const sections = data?.totalSchedulesInCycle || 3

	return (
		<Card className={cardClass}>
			<Flex vertical gap={24}>
				<Flex gap={10} align='start'>
					<Flex gap={8} className={styles.cardType}>
						{isOff ? <img src={iconClock} alt='icon clock' /> : <img src={iconTree} alt='icon tree' />}
						<Text className={styles.label}>{isOff ? 'ساعت خاموشی' : data?.type === 'land' ? 'نام زمین' : 'نام گروه'}</Text>
					</Flex>
					{!isOff && (
						<Flex className={styles.cardRole}>
							{data?.title ? (
								<Link to={data?.groupId ? `/wells/${wellId}/groups/${data.groupId}` : `/lands/${landId}`} className={styles.land_name}>
									{data?.title}
								</Link>
							) : (
								<Text>-</Text>
							)}
						</Flex>
					)}
				</Flex>

				{isOff ? (
					<>
						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>شروع</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{data?.startTime ? moment(data.startTime).format('HH:mm - jYYYY/jMM/jDD') : '-'}</Text>
							</Flex>
						</Flex>

						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>پایان</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{data?.endTime ? moment(data.endTime).format('HH:mm - jYYYY/jMM/jDD') : '-'}</Text>
							</Flex>
						</Flex>
					</>
				) : (
					<>
						{isThisLogOngoing && (
							<Flex gap={10}>
								<Flex gap={8} className={styles.cardType}>
									<img src={iconClock} alt='icon clock' />
									<Text className={styles.label}>درحال آبیاری</Text>
								</Flex>
								<Flex className={styles.cardRole}>
									<Text className={styles.text_irrigation} style={{ color: isOver ? 'red' : 'green' }}>
										{countdown || '-'}
									</Text>
								</Flex>
							</Flex>
						)}

						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>آب مورد نیاز</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{data?.requiredWater || '-'}</Text>
							</Flex>
						</Flex>

						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>آب دریافت شده</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{data?.receivedWater || '-'}</Text>
							</Flex>
						</Flex>

						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>باقیمانده</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{data?.remainingWater || '-'}</Text>
							</Flex>
						</Flex>

						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>زمان آبیاری بعدی</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>
									{data?.nextIrrigation ? moment(data.nextIrrigation).format('HH:mm - jYYYY/jMM/jDD') : '-'}
								</Text>
							</Flex>
						</Flex>

						<ProgressBar sections={sections} progressValue={progressValue} />
					</>
				)}
			</Flex>
		</Card>
	)
}

export default WellLogsMobile
