import { Card, Typography, Flex } from 'antd'
import { useState } from 'react'
import styles from './NotificationCard.module.css'
import EditNotification from '../../Notifications/EditNotification/EditNotification'

const titleMap = {
	otp: 'اطلاع رسانی کد تایید',
	irrigation_start_irrigator: 'اطلاع رسانی آبرسانی - شروع آبرسانی برای میرآب',
	irrigation_end_irrigator: 'اطلاع رسانی آبرسانی - پایان آبرسانی برای میرآب',
	irrigation_start_landowner: 'اطلاع رسانی آبرسانی - شروع آبرسانی برای مالک زمین',
	irrigation_end_landowner: 'اطلاع رسانی آبرسانی - پایان آبرسانی برای مالک زمین',
	log_change_description: 'امکان تغییر توضیحات لاگ توسط صیاد',
	log_operator_time_limit: 'محدودیت در زمان ثبت لاگ اپراتور',
}

const NotificationCard = ({ data }) => {
	const [template, setTemplate] = useState(data)

	return (
		<Card className={styles.item}>
			<Flex vertical gap={16}>
				<Flex className='heading-container' align='center' justify='space-between'>
					<Typography.Title className={styles['card-title']}>{titleMap[template.key]}</Typography.Title>
					<EditNotification template={template} setTemplate={setTemplate} title={titleMap[template.key]} />
				</Flex>
				<Typography.Text className={styles['card-text']}>{template.text}</Typography.Text>
			</Flex>
		</Card>
	)
}

export default NotificationCard
