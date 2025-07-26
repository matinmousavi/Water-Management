import { useState } from 'react'
import { Flex, Typography } from 'antd'
import EditNotification from './EditNotification/EditNotification'
import SettingsCard from '../SettingsCard/SettingsCard'
import styles from '../SettingsCard/SettingsCard.module.css'

const Notifications = ({ data }) => {
	const [templates, setTemplates] = useState(data || [])

	const templateTitles = {
		otp: 'اطلاع‌رسانی کد تایید',
		irrigation_start_irrigator: 'اطلاع‌رسانی آب‌رسانی - شروع آب‌رسانی برای میرآب',
		irrigation_end_irrigator: 'اطلاع‌رسانی آب‌رسانی - پایان آب‌رسانی برای میرآب',
		irrigation_start_landowner: 'اطلاع‌رسانی آب‌رسانی - شروع آب‌رسانی برای مالک زمین',
		irrigation_end_landowner: 'اطلاع‌رسانی آب‌رسانی - پایان آب‌رسانی برای مالک زمین',
	}

	return (
		<Flex vertical gap={16}>
			<Typography.Title level={2} className='text-page-title'>
				تنظیمات اطلاع‌رسانی
			</Typography.Title>

			{templates.map((template, index) => (
				<SettingsCard
					key={index}
					title={templateTitles[template.key] || 'عنوان نامشخص'}
					action={<EditNotification template={template} setTemplate={setTemplates} title={templateTitles[template.key]} />}
				>
					<Typography.Text className={styles['card-text']}>{template.text}</Typography.Text>
				</SettingsCard>
			))}
		</Flex>
	)
}

export default Notifications
