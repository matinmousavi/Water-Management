import { Flex, Card, Typography } from 'antd'
import moment from 'moment-jalaali'

import styles from './LandInfoMobile.module.css'

import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
import iconContacts from '../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
import ProgressBar from '../../../../../../../components/ProgressBar/ProgressBar'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const { Text } = Typography

const LandInfoMobile = ({ data }) => {
	const well = data?.wells?.[0] || {}

	const totalMsInCycle = well?.totalSchedulesInCycle * 60 * 60 * 1000 || 0
	const receivedMsInCycle = (() => {
		if (!well?.receivedWaterInCycle) return 0
		const [h, m] = well.receivedWaterInCycle.split(':').map(Number)
		return h * 3600000 + m * 60000
	})()

	const progressValue = totalMsInCycle ? (receivedMsInCycle / totalMsInCycle) * 100 : 0
	const sections = well?.totalSchedulesInCycle || 3

	const listItems = [
		{ icon: iconContacts, title: 'نام زمین', value: data?.title || '-' },
		{ icon: iconPhone, title: 'شماره تماس', value: data?.owner?.mobile || '-' },
		{ icon: iconLocation, title: 'آدرس زمین', value: data?.location || '-' },
		{
			icon: iconClock,
			title: 'زمان آبیاری بعدی',
			value: well?.nextIrrigation ? moment(well.nextIrrigation).format('HH:mm - jYYYY/jMM/jDD') : '-',
		},
		{ icon: iconClock, title: 'آب مورد نیاز', value: well?.requiredWater || '-' },
		{ icon: iconClock, title: 'آب دریافت شده', value: well?.receivedWater || '-' },
		{ icon: iconClock, title: 'زمان باقی مانده', value: well?.remainingWater || '-' },
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
