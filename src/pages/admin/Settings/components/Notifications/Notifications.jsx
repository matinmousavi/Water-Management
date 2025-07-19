import { useState } from 'react'
import SettingsCard from '../SettingsSection/SettingsCard/SettingsCard'
import SettingsSection from '../SettingsSection/SettingsSection'
import EditNotification from './EditNotification/EditNotification'

const Notifications = ({ data, meta }) => {
	const [templates, setTemplates] = useState(data || [])
console.log(templates);

	return (
		<SettingsSection title='تنظیمات اطلاع‌رسانی'>
			{templates.map((template, index) => (
				<SettingsCard key={index} data={template} title={meta[template.key]?.title} description={meta[template.key]?.description}>
					<EditNotification template={template} setTemplate={setTemplates} title={meta[template.key]?.title} />
				</SettingsCard>
			))}
		</SettingsSection>
	)
}

export default Notifications
