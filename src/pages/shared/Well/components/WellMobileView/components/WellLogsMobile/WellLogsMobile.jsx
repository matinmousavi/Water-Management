import { useEffect, useState } from 'react'
import { Card, Flex, Typography } from 'antd'
import moment from 'moment-jalaali'
import { Link } from 'react-router'

import TimerDisplay from '../../../../../../../components/TimerDisplay/TimerDisplay'
import styles from './WellLogsMobile.module.css'

import iconTree from '../../../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'

import { getIrrigationStartTime } from '../../../../../../../utils/irrigationStorage'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const { Text } = Typography

const WellLogsMobile = ({ wellId, data }) => {
	const isThisLogOngoing = data?.isOngoing
	const landId = data?.land?._id

	const [startedAt, setStartedAt] = useState(null)

	useEffect(() => {
		if (!landId || !groupId) {
			console.error('landId is missing:', landId)
			return
		}

		const irrigationStartTime = getIrrigationStartTime(landId)

		if (!irrigationStartTime) {
			console.error('irrigationStartTime not found in localStorage for landId:', landId)
			return
		}
		setStartedAt(Number(irrigationStartTime))
	}, [landId, isThisLogOngoing])

	return (
		<Card className={(data?.irrigationInProgress || isThisLogOngoing) && styles.borderCard}>
			<Flex vertical gap={24}>
				<Flex gap={10} align='start'>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconTree} alt='icon tree' />
						{data?.type == 'land' ? <Text className={styles.label}>نام زمین</Text> : <Text className={styles.label}>نام گروه</Text>}
					</Flex>
					<Flex className={styles.cardRole}>
						{data?.title ? (
							<Link to={data?.groupId ? `wells/${wellId}/groups/${data.id}` : `lands/${data?.landId}`} className={styles.land_name}>
								{data?.title}
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
							{isThisLogOngoing || data?.irrigationInProgress ? (
								data?.type === 'land' ? (
									// آبیاری تکی (زمین)
									startedAt ? (
										<span className={styles.timerText}>
											<TimerDisplay startedAt={startedAt} />
										</span>
									) : (
										<Text className={styles.text_irrigation}>{moment(data?.endedAt).format('HH:mm - jYYYY/jMM/jDD') || '-'}</Text>
									)
								) : // آبیاری گروهی
								data?.irrigationStartedAt ? (
									<span className={styles.timerText}>
										<TimerDisplay startedAt={data?.irrigationStartedAt} />
									</span>
								) : (
									<Text className={styles.text_irrigation}>{moment(data?.lastIrrigation).format('HH:mm - jYYYY/jMM/jDD') || '-'}</Text>
								)
							) : null}
						</Text>
					</Flex>
				</Flex>

				<Flex gap={10}>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconClock} alt='icon clock' />
						<Text className={styles.label}>زمان آبیاری بعدی</Text>
					</Flex>
					<Flex className={styles.cardRole}>
						<Text className={styles.text_irrigation}>{moment(data?.nextIrrigation).format('HH:mm - jYYYY/jMM/jDD') || '-'}</Text>
					</Flex>
				</Flex>
			</Flex>
		</Card>
	)
}

export default WellLogsMobile
