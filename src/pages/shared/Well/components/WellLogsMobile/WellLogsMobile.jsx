import { Card, Flex, Typography } from 'antd'
import styles from './WellLogsMobile.module.css'
import iconTree from '../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../assets/icons/ClockCircleOutlined.svg'
import moment from 'moment-jalaali'
import { Link } from 'react-router'
import { useIrrigationTimer } from '../../../../../contexts/IrrigationTimerContext'

const formatTime = seconds => {
	const hrs = Math.floor(seconds / 3600)
	const mins = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60
	return `${secs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${hrs.toString().padStart(2, '0')}`
}

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const { Text } = Typography

const WellLogsMobile = ({ data }) => {
	const { isIrrigating, elapsedTime, landID } = useIrrigationTimer()

	const isThisLandBeingIrrigated = isIrrigating && landID === data?.land?._id

	return (
		<Card>
			<Flex vertical gap={18}>
				<Flex gap={10} align='start'>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconTree} alt='icon tree' />
						<Text>نام زمین</Text>
					</Flex>
					<Flex className={styles.cardRole}>{data?.land ? <Link to={`/lands/${data?.land?._id}`}>{data?.land?.title}</Link> : <Text>-</Text>}</Flex>
				</Flex>

				<Flex gap={10}>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconClock} alt='icon tree' />
						<Text>آخرین زمان آبیاری</Text>
					</Flex>
					<Flex className={styles.cardRole}>
						<Text>
							{isThisLandBeingIrrigated && data?.isOngoing ? (
								<span className={`${styles.timerText} ${elapsedTime <= 900 ? styles.timerDanger : ''}`}>{formatTime(elapsedTime)}</span>
							) : (
								moment(data?.endedAt).format('jYYYY/jMM/jDD-HH:mm') || '-'
							)}
						</Text>
					</Flex>
				</Flex>
				<Flex gap={10}>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconClock} alt='icon tree' />
						<Text>زمان آبیاری بعدی</Text>
					</Flex>
					<Flex className={styles.cardRole}>
						<Text>{moment(data?.updatedAt).format('dddd jD jMMMM jYYYY') || '-'}</Text>
					</Flex>
				</Flex>
			</Flex>
		</Card>
	)
}
export default WellLogsMobile
