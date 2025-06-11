import { Card, Flex, Table, Typography } from 'antd'
import moment from 'moment-jalaali'
import styles from './MobileLandInfo.module.css'
import iconClock from '../../../../../../../../../assets/icons/ClockCircleOutlined.svg'
import iconLocation from '../../../../../../../../../assets/icons/EnvironmentOutlined.svg'
import iconContacts from '../../../../../../../../../assets/icons/ContactsOutlined.svg'
import iconPhone from '../../../../../../../../../assets/icons/PhoneOutlined.svg'
import { EyeOutlined } from '@ant-design/icons'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const MobileLandInfo = ({ data }) => {
	const { Text } = Typography
	const listItems = [
		{
			icon: iconContacts,
			title: 'نام زمین',
			value: data?.name,
		},
		{
			icon: iconPhone,
			title: 'شماره تماس',
			value: data?.owner?.mobile,
		},
		{
			icon: iconLocation,
			title: 'آدرس زمین',
			value: data?.location,
		},
		{
			icon: iconClock,
			title: 'آخرین زمان آبیاری',
			value: moment(data?.createAt).format('dddd jD jMMMM jYYYY') || '-',
		},
		{
			icon: iconClock,
			title: 'زمان آبیاری بعدی',
			value: moment(data?.updatedAt).format('dddd jD jMMMM jYYYY') || '-',
		},
	]

	const mockData = [
		{
			key: '1',
			date: 'یک‌شنبه ١١ خرداد ١٤٠٤',
			startTime: '١٧:٠٠',
			timeIrrigation: '۲ ساعت و ۳۰ دقیقه',
			description: 'در حال آبیاری',
		},
		{
			key: '2',
			date: 'یک‌شنبه ٤ خرداد ١٤٠٤',
			startTime: '١٢:٠٠',
			timeIrrigation: '۲ ساعت',
			description: '-',
		},
		{
			key: '3',
			date: 'دوشنبه ٢٨ اردیبهشت ١٤٠٤',
			startTime: '٠٨:٣٠',
			timeIrrigation: '۱ ساعت و ۴۵ دقیقه',
			description: 'قطع برق',
		},
	]

	const columns = [
		{
			title: 'تاریخ',
			dataIndex: 'date',
			key: 'date',
			render: text => text,
		},
		{
			title: 'ساعت شروع',
			dataIndex: 'startTime',
			key: 'startTime',
		},
		{
			title: 'مدت زمان آبیاری',
			dataIndex: 'timeIrrigation',
			key: 'timeIrrigation',
		},
		{
			title: 'توضیحات',
			dataIndex: 'description',
			key: 'description',
			render: () => (
				<Flex align='center' justify='center' gap={8}>
					<EyeOutlined style={{ color: '#1890ff' }} />
				</Flex>
			),
		},
	]
	return (
		<Flex vertical>
			<Card className={styles.card}>
				<Flex vertical gap={8}>
					{listItems.map((item, index) => (
						<Flex key={index} gap={10} align='start'>
							<Flex gap={8} className={styles.cardType}>
								<img src={item.icon} alt='icon tree' />
								<Text>{item.title}</Text>
							</Flex>
							<Flex className={styles.cardRole}>
								<Text>{item.value}</Text>
							</Flex>
						</Flex>
					))}
				</Flex>
			</Card>
			<Card>
				<Text>لاگ توزیع آب ({mockData.length})</Text>
				<Table pagination={false} className={styles.table} dataSource={mockData} columns={columns} />
			</Card>
		</Flex>
	)
}
export default MobileLandInfo
