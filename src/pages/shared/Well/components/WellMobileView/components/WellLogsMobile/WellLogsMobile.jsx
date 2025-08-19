import { Card, Flex, Typography } from 'antd'
import moment from 'moment-jalaali'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'

import TimerDisplay from '../../../../../../../components/TimerDisplay/TimerDisplay'
import styles from './WellLogsMobile.module.css'

import iconTree from '../../../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'

import { getIrrigationStartTime } from '../../../../../../../utils/irrigationStorage'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const { Text } = Typography

const WellLogsMobile = ({ wellId, data }) => {
	const isThisLogOngoing = data?.isOngoing
	const isOff = data?.type === 'off'
	const landId = data?.land?._id

	const [startedAt, setStartedAt] = useState(null)

	useEffect(() => {
		if (!landId || isOff) return

		const irrigationStartTime = getIrrigationStartTime(landId)
		if (irrigationStartTime) setStartedAt(Number(irrigationStartTime))
	}, [landId, isThisLogOngoing, isOff])

	// کلاس کارت با منطق سبز/قرمز بر اساس irrigationEndsAt
	let cardClass = ''
	if (isOff) {
		cardClass = styles.offCard
	} else if (data?.irrigationInProgress || isThisLogOngoing) {
		if (data?.irrigationEndsAt && new Date() > new Date(data.irrigationEndsAt)) {
			cardClass = styles.borderCardDanger // قرمز
		} else {
			cardClass = styles.borderCard // سبز
			console.log(cardClass)
		}
	}

	return (
		<Card className={cardClass}>
			<Flex vertical gap={24}>
				{/* لیبل و آیکون */}
				<Flex gap={10} align='start'>
					<Flex gap={8} className={styles.cardType}>
						{isOff ? <img src={iconClock} alt='icon clock' /> : <img src={iconTree} alt='icon tree' />}
						<Text className={styles.label}>{isOff ? 'ساعت خاموشی' : data?.type === 'land' ? 'نام زمین' : 'نام گروه'}</Text>
					</Flex>
					{!isOff && (
						<Flex className={styles.cardRole}>
							{data?.title ? (
								<Link to={data?.groupId ? `wells/${wellId}/groups/${data.groupId}` : `lands/${data?.landId}`} className={styles.land_name}>
									{data?.title}
								</Link>
							) : (
								<Text>-</Text>
							)}
						</Flex>
					)}
				</Flex>

				{/* محتوا */}
				{isOff ? (
					<>
						{/* ساعت شروع */}
						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>شروع</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{moment(data?.startTime).format('HH:mm - jYYYY/jMM/jDD')}</Text>
							</Flex>
						</Flex>

						{/* ساعت پایان */}
						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>پایان</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{moment(data?.endTime).format('HH:mm - jYYYY/jMM/jDD')}</Text>
							</Flex>
						</Flex>
					</>
				) : (
					<>
						{/* آخرین زمان آبیاری */}
						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>آب دریافت شده</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>
									{isThisLogOngoing || data?.irrigationInProgress ? (
										data?.type === 'land' ? (
											startedAt ? (
												<span className={styles.timerText}>
													<TimerDisplay startedAt={startedAt} />
												</span>
											) : (
												<Text className={styles.text_irrigation}>{moment(data?.endedAt).format('HH:mm - jYYYY/jMM/jDD') || '--'}</Text>
											)
										) : data?.irrigationStartedAt ? (
											<span className={styles.timerText}>
												<TimerDisplay startedAt={data?.irrigationStartedAt} endedAt={data?.irrigationEndsAt} />
											</span>
										) : (
											<Text className={styles.text_irrigation}>
												{moment(data?.lastIrrigation).format('HH:mm - jYYYY/jMM/jDD') || '--'}
											</Text>
										)
									) : (
										'--'
									)}
								</Text>
							</Flex>
						</Flex>

						{/* زمان آبیاری بعدی */}
						<Flex gap={10}>
							<Flex gap={8} className={styles.cardType}>
								<img src={iconClock} alt='icon clock' />
								<Text className={styles.label}>زمان آبیاری بعدی</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text className={styles.text_irrigation}>{moment(data?.nextIrrigation).format('HH:mm - jYYYY/jMM/jDD') || '-'}</Text>
							</Flex>
						</Flex>
					</>
				)}
			</Flex>
		</Card>
	)
}

export default WellLogsMobile
