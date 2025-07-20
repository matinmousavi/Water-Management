import { useState, useMemo } from 'react'
import { Flex, Typography } from 'antd'
import EditLogging from './EditLogging/EditLogging'
import SettingsCard from '../SettingsCard/SettingsCard'
import english2persian from '../../../../../utils/english2persian'
import styles from '../SettingsCard/SettingsCard.module.css'

const Irrigations = ({ data }) => {
	const initialTemplates = useMemo(() => {
		if (!data) return []
		return Object.entries(data).map(([key, value]) => ({
			key,
			time: value.time,
		}))
	}, [data])

	const [values, setValues] = useState(initialTemplates)

	const titles = {
		descriptionEditHours: 'امکان ویرایش توضیحات لاگ توسط میرآب',
		logTimeMarginMinutes: 'محدودیت در زمان ثبت لاگ آبرسانی',
	}

	const renderDescription = (key, time) => {
		const timePersian = english2persian(String(time))
		switch (key) {
			case 'descriptionEditHours':
				return `${timePersian} ساعت پس از ثبت لاگ`
			case 'logTimeMarginMinutes':
				return `${timePersian} دقیقه پیش از زمان ثبت لاگ`
			default:
				return ''
		}
	}

	return (
		<Flex vertical gap={16}>
			<Typography.Title level={2} className='text-page-title'>
				تنظیمات ثبت لاگ
			</Typography.Title>

			{values.map((value, index) => (
				<SettingsCard
					key={index}
					title={titles[value.key] || 'عنوان نامشخص'}
					action={<EditLogging value={value} setValues={setValues} title={titles[value.key]} />}
				>
					<Typography.Text className={styles['card-text']}>{renderDescription(value.key, value.time)}</Typography.Text>
				</SettingsCard>
			))}
		</Flex>
	)
}

export default Irrigations
