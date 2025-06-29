import { Card, Typography, Flex } from 'antd'
import styles from '../../Notifications.module.css'
import EditNotification from '../EditNotification/EditNotification'
import { useState } from 'react'

const titleMap = {
	otp: 'اطلاع رسانی کد تایید',
	irrigation_start_irrigator: 'اطلاع رسانی آبرسانی - شروع آبرسانی برای میرآب',
	irrigation_end_irrigator: 'اطلاع رسانی آبرسانی - پایان آبرسانی برای میرآب',
	irrigation_start_landowner: 'اطلاع رسانی آبرسانی - شروع آبرسانی برای مالک زمین',
	irrigation_end_landowner: 'اطلاع رسانی آبرسانی - پایان آبرسانی برای مالک زمین',
}

const NotificationCard = ({ data }) => {
	const [template, setTemplate] = useState(data)

	return (
		<Card className={styles.item}>
			<Flex vertical>
				<Flex className='heading-container' align='center' justify='space-between'>
					<Typography.Title className='text-card-title'>{titleMap[template.key]}</Typography.Title>
					<EditNotification template={template} setTemplate={setTemplate} title={titleMap[template.key]} />
				</Flex>
				<Typography.Text className='text-paragraph'>{template.text}</Typography.Text>
			</Flex>
		</Card>
	)
}

export default NotificationCard
