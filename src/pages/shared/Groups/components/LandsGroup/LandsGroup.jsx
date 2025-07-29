import iconTree from '../../../../../assets/icons/ri_tree-line.svg'
import iconClock from '../../../../../assets/icons/ClockCircleOutlined.svg'
import iconContact from '../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../assets/icons/PhoneOutlined.svg'
import iconLocation from '../../../../../assets/icons/EnvironmentOutlined.svg'
import styles from './LandsGroup.module.css'
import { Card, Flex, Typography } from 'antd'
import { Link } from 'react-router'
import moment from 'moment-jalaali'

const { Text } = Typography

const landData = [
	{
		label: 'نام زمین',
		icon: iconTree,
		content: <Link to='/'>گلستان</Link>,
	},
	{
		label: 'نام مالک',
		icon: iconContact,
		content: <Text>اصغر قاسمی</Text>,
	},
	{
		label: 'شماره تماس',
		icon: iconPhone,
		content: <Text>09156666666</Text>,
	},
	{
		label: 'آدرس زمین',
		icon: iconLocation,
		content: <Text>شهرک گل ها</Text>,
	},
	{
		label: 'آخرین زمان آبیاری',
		icon: iconClock,
		content: <Text>{moment(new Date()).format('HH:mm - jYYYY/jMM/jDD')}</Text>,
	},
	{
		label: 'زمان آبیاری بعدی',
		icon: iconClock,
		content: <Text>{moment(new Date()).format('HH:mm - jYYYY/jMM/jDD')}</Text>,
	},
]

const LandsGroup = () => {
	return (
		<Flex vertical>
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
		</Flex>
	)
}

export default LandsGroup
