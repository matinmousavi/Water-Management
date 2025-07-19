import { useState } from 'react'
import SettingsCard from '../SettingsSection/SettingsCard/SettingsCard'
import SettingsSection from '../SettingsSection/SettingsSection'
import { Button } from 'antd'

const BroadcastNotification = ({ mockLogs, titleMap }) => {
const publicInformationRegistration = mockLogs.filter(item => item.key === 'public_information_registration')
	const [templates, setTemplates] = useState(publicInformationRegistration)
	return (
		<SettingsSection title='تنظیمات ثبت لاگ'>
			{templates.map((template, index) => (
				<SettingsCard key={index} data={template} title={titleMap[template.key]} setTemplates={setTemplates}>
					<Button type='primary'>ارسال به همه</Button>
					</SettingsCard>
				))}
		</SettingsSection>
	)
}

export default BroadcastNotification
