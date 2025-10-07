import { useEffect, useState } from 'react'
import { Card, Flex, Typography } from 'antd'
import { Link } from 'react-router'
import iconTree from '../../../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconContact from '../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
import moment from 'moment-jalaali'
import styles from './LandItemGroup.module.css'
import ProgressBar from '../../../../../../../components/common/ProgressBar/ProgressBar'

const LandItemGroup = ({ data, group }) => {
	const { Text } = Typography

	const totalMsInCycle = group?.totalSchedulesInCycle * 60 * 60 * 1000 || 0

	const receivedMsInCycle = (() => {
		if (!group?.receivedWaterInCycle) return 0
		const [h, m] = group.receivedWaterInCycle.split(':').map(Number)
		return h * 3600000 + m * 60000
	})()

	const targetRatio = totalMsInCycle ? receivedMsInCycle / totalMsInCycle : 0
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

	const landData = [
		{
			label: 'نام زمین',
			icon: iconTree,
			content: <Link to={`/lands/${data._id}`}>{data?.title}</Link>,
		},
		{
			label: 'نام مالک',
			icon: iconContact,
			content: <Text>{data?.owner?.fullName}</Text>,
		},
		{
			label: 'شماره تماس',
			icon: iconPhone,
			content: <Text>{data?.owner?.mobile}</Text>,
		},
		{
			label: 'آدرس زمین',
			icon: iconLocation,
			content: <Text>{data?.location}</Text>,
		},
		{
			label: 'زمان آبیاری بعدی',
			icon: iconClock,
			content: <Text>{group?.nextIrrigationAt ? moment(group.nextIrrigationAt).format('HH:mm - jYYYY/jMM/jDD') : '-'}</Text>,
		},
		{ icon: iconClock, label: 'آب مورد نیاز', content: group?.requiredWater || '-' },
		{ icon: iconClock, label: 'آب دریافت شده', content: group?.receivedWater || '-' },
		{ icon: iconClock, label: 'زمان باقی مانده', content: group?.remainingWater || '-' },
	]

	return (
		<Card>
			<Flex vertical gap={24}>
				{landData.map((item, index) => (
					<Flex key={index} gap={10} align='start'>
						<Flex gap={8} className={styles.cardType}>
							<img src={item.icon} alt='icon' />
							<Text className={styles.label}>{item.label}</Text>
						</Flex>
						<Flex className={styles.cardRole}>{item.content}</Flex>
					</Flex>
				))}
				<ProgressBar progressRatio={progressRatio} />
			</Flex>
		</Card>
	)
}

export default LandItemGroup
