import { useEffect, useState } from 'react'
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

	const [reqH, reqM] = well?.requiredWater?.split(':').map(Number) || [0, 0]
	const requiredMs = reqH * 3600000 + reqM * 60000

	const [recH, recM] = well?.receivedWater?.split(':').map(Number) || [0, 0]
	const receivedMs = recH * 3600000 + recM * 60000

	const targetRatio = requiredMs > 0 ? receivedMs / requiredMs : 0
	const [progressRatio, setProgressRatio] = useState(0)

	useEffect(() => {
		let frame
		let start

		if (targetRatio <= 0) {
			setProgressRatio(0)
			return
		}

		const duration = 1000

		const animate = timestamp => {
			if (!start) start = timestamp
			const elapsed = timestamp - start
			const progress = Math.min(elapsed / duration, 1)
			setProgressRatio(progress * targetRatio)
			if (progress < 1) frame = requestAnimationFrame(animate)
		}

		frame = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(frame)
	}, [targetRatio])

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

				<ProgressBar progressRatio={progressRatio} />
			</Flex>
		</Card>
	)
}

export default LandInfoMobile
