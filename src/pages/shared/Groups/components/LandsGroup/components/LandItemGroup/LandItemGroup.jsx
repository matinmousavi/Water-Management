import { Card, Flex, Typography } from 'antd'
import { Link } from 'react-router'
import iconTree from '../../../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconContact from '../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../assets/icons/PhoneOutlined.svg'
import iconLocation from '../../../../../../../assets/icons/EnvironmentOutlined.svg'
import moment from 'moment-jalaali'
import styles from './LandItemGroup.module.css'
import ProgressBar from '../../../../../../../components/ProgressBar/ProgressBar'

const LandItemGroup = ({ data }) => {
	const { Text } = Typography

	const sections = Math.floor(Math.random() * 4) + 2
	const progressValue = 40

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
			content: <Text>{moment(new Date()).format('HH:mm - jYYYY/jMM/jDD')}</Text>,
		},
		{ icon: iconClock, label: 'آب مورد نیاز', content: '3 ساعت' || '-' },
		{ icon: iconClock, label: 'آب دریافت شده', content: '1 ساعت و 45 دقیقه' || '-' },
		{ icon: iconClock, label: 'زمان باقی مانده', content: '15 دقیفه' || '-' },
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
				{/* <ProgressBar sections={sections} progressValue={progressValue} /> */}
			</Flex>
		</Card>
	)
}

export default LandItemGroup
