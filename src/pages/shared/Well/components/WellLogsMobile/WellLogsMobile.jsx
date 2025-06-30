import { Card, Flex, Typography } from 'antd'
import styles from './WellLogsMobile.module.css'
import iconTree from '../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../assets/icons/ClockCircleOutlined.svg'
import moment from 'moment-jalaali'
import { Link } from 'react-router'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })
const WellLogsMobile = ({ data }) => {
	const { Text } = Typography

	return (
		<Card>
			<Flex vertical gap={18}>
				<Flex gap={10} align='start'>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconTree} alt='icon tree' />
						<Text>نام زمین</Text>
					</Flex>
					<Flex className={styles.cardRole}>{data?.land ? <Link to={`/lands/${data?.land._id}`}>{data?.land?.name}</Link> : <Text>-</Text>}</Flex>
				</Flex>

				<Flex gap={10}>
					<Flex gap={8} className={styles.cardType}>
						<img src={iconClock} alt='icon tree' />
						<Text>آخرین زمان آبیاری</Text>
					</Flex>
					<Flex className={styles.cardRole}>
						<Text>{moment(data?.start).format('dddd jD jMMMM jYYYY') || '-'}</Text>
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
