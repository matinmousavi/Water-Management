import { Card, Flex, Typography } from 'antd'
import { Link } from 'react-router'
import iconTree from '../../../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconContact from '../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
import moment from 'moment-jalaali'
import styles from './LandItemGroup.module.css'
const LandItemGroup = ({ data }) => {
	const { Text } = Typography
	const landData = [
		{
			label: 'نام زمین',
			icon: iconTree,
			content: <Link to='/'>{data?.title}</Link>,
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
			label: 'آخرین زمان آبیاری',
			icon: iconClock,
			content: <Text>{data?.lastIrrigatedAt ? moment(data?.lastIrrigatedAt).format('HH:mm - jYYYY/jMM/jDD') : '--'}</Text>,
		},
		{
			label: 'زمان آبیاری بعدی',
			icon: iconClock,
			content: <Text>{moment(new Date()).format('HH:mm - jYYYY/jMM/jDD')}</Text>,
		},
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
			</Flex>
		</Card>
	)
}

export default LandItemGroup
