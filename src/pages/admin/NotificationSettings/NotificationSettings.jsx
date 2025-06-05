import { Flex, Card, Typography } from 'antd'
import BreadCrumbs from '../../../components/BreadCrumbs/BreadCrumbs'

const { Title } = Typography

const NotificationSettings = () => {
	return (
		<Flex vertical gap={32}>
			<BreadCrumbs />
			<Flex vertical gap={16}>
				<Card>
					<Title className='text-h2'>اطلاع رسانی OTP</Title>
				</Card>
				<Card>
					<Title className='text-h2'>اطلاع رسانی آبرسانی</Title>
				</Card>
			</Flex>
		</Flex>
	)
}

export default NotificationSettings
