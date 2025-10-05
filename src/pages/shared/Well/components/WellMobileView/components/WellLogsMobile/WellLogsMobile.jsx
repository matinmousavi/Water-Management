import { Card, Flex, Typography } from 'antd'
import moment from 'moment-jalaali'
import { Link } from 'react-router'
import { useEffect, useRef, useState } from 'react'

import styles from './WellLogsMobile.module.css'

import iconTree from '../../../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconTreeGroup from '../../../../../../../assets/icons/treeGroup.svg'

import ProgressBar from '../../../../../../../components/ProgressBar/ProgressBar'

const { Text } = Typography

const timeToMinutes = (timeStr = '0:00') => {
	if (!timeStr) return 0
	const [h, m] = timeStr.split(':').map(Number)
	return h * 60 + m
}

const WellLogsMobile = ({ wellId, data }) => {
	const isThisLogOngoing = data?.irrigationInProgress
	const isOff = data?.type === 'off'
	const landId = data?.landId

	const countdownRef = useRef(null)
	const [isOver, setIsOver] = useState(false)
	const [progressRatio, setProgressRatio] = useState(0)

	const requiredMinutes = timeToMinutes(data?.requiredWater)
	const receivedMinutesInitial = timeToMinutes(data?.receivedWaterInCycle)

	useEffect(() => {
		if (!requiredMinutes) {
			setProgressRatio(0)
			return
		}

		const calcProgress = () => {
			let receivedMinutes = receivedMinutesInitial
			if (isThisLogOngoing && data?.irrigationStartedAt) {
				const startedAt = new Date(data.irrigationStartedAt).getTime()
				const now = Date.now()
				const minutesSinceStart = (now - startedAt) / 60000
				receivedMinutes += minutesSinceStart
			}
			setProgressRatio(receivedMinutes / requiredMinutes)
		}

		calcProgress()
		if (isThisLogOngoing) {
			const interval = setInterval(calcProgress, 1000)
			return () => clearInterval(interval)
		}
	}, [isThisLogOngoing, data?.irrigationStartedAt, requiredMinutes, receivedMinutesInitial])

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

			const over = diff < 0
			setIsOver(over)

			if (countdownRef.current) {
				countdownRef.current.innerText = over ? `-${formatTime(Math.abs(diff))}` : formatTime(diff)
				countdownRef.current.style.color = over ? 'red' : 'green'
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [isThisLogOngoing, data?.irrigationStartedAt, data?.remainingWater])

	const isToday = data?.dayInCycle === data?.todayDayInCycle

	let cardClass = ''
	if (!isToday || isOff) {
		cardClass = styles.offCard
	} else if (isThisLogOngoing) {
		cardClass = isOver ? styles.borderCardDanger : styles.borderCard
	}

	return (
		<Card className={cardClass}>
			<Flex vertical gap={24}>
				<Flex gap={10} align='start'>
					<Flex gap={8} className={styles.cardType}>
						{isOff ? (
							<img src={iconClock} alt='icon clock' />
						) : data?.type === 'land' ? (
							<img src={iconTree} alt='icon tree' />
						) : (
							<img src={iconTreeGroup} alt='icon tree' />
						)}
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

				{isThisLogOngoing && (
					<Flex gap={10}>
						<Flex gap={8} className={styles.cardType}>
							<img src={iconClock} alt='icon clock' />
							<Text className={styles.label}>درحال آبیاری</Text>
						</Flex>
						<Flex className={styles.cardRole}>
							<Text ref={countdownRef} className={styles.text_irrigation}>
								{'-'}
							</Text>
						</Flex>
					</Flex>
				)}

				{!isThisLogOngoing && (
					<>
						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>سهمیه دریافت شده</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{data?.receivedWater || '-'}</Text>
							</Flex>
						</Flex>

						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>مقدار سهمیه</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{data?.requiredWater || '-'}</Text>
							</Flex>
						</Flex>

						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>سهمیه باقی مانده</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{data?.remainingWater || '-'}</Text>
							</Flex>
						</Flex>

						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>آخرین زمان آبیاری</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>
									{data?.lastIrrigation ? moment(data.lastIrrigation).format('HH:mm - jYYYY/jMM/jDD') : '-'}
								</Text>
							</Flex>
						</Flex>
					</>
				)}

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

				{isToday && <ProgressBar progressRatio={progressRatio} />}
			</Flex>
		</Card>
	)
}

export default WellLogsMobile
