import { Flex, Card, Typography } from 'antd'

import moment from 'moment-jalaali'

import styles from './LandInfoMobile.module.css'

import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
import iconContacts from '../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
import ProgressBar from '../../../../../../../components/ProgressBar/ProgressBar'

const { Text } = Typography

const LandInfoMobile = ({ data }) => {
	const sections = Math.floor(Math.random() * 4) + 2
	const progressValue = 40
	const listItems = [
		{ icon: iconContacts, title: 'نام زمین', value: data?.title || '-' },
		{ icon: iconPhone, title: 'شماره تماس', value: data?.owner?.mobile || '-' },
		{ icon: iconLocation, title: 'آدرس زمین', value: data?.location || '-' },
		{ icon: iconClock, title: 'زمان آبیاری بعدی', value: moment(data?.updatedAt).format('dddd jD jMMMM jYYYY') || '-' },
		{ icon: iconClock, title: 'آب مورد نیاز', value: '3 ساعت' || '-' },
		{ icon: iconClock, title: 'آب دریافت شده', value: '1 ساعت و 45 دقیقه' || '-' },
		{ icon: iconClock, title: 'زمان باقی مانده', value: '15 دقیفه' || '-' },
	]

	return (
		<Card className={styles.card}>
			<Flex vertical gap={8}>
				{listItems.map((item, idx) => (
					<Flex className={styles.itemCard} key={idx} gap={10} align='center' justify='center'>
						<Flex gap={8} className={styles.cardType}>
							<img src={item.icon} alt='icon' />
							<Text className={styles.label}>{item.title}</Text>
						</Flex>
						<Flex className={styles.cardRole}>
							<Text className={styles.value}>{item.value}</Text>
						</Flex>
					</Flex>
				))}
				<ProgressBar sections={sections} progressValue={progressValue} />
			</Flex>
		</Card>
	)
}

export default LandInfoMobile
