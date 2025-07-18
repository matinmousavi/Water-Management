import { useState } from 'react'
import SettingsCard from '../SettingsSection/SettingsCard/SettingsCard'
import SettingsSection from '../SettingsSection/SettingsSection'
import EditLogging from './EditLogging/EditLogging'

const Logging = ({ mockLogs, titleMap }) => {
	const [templates, setTemplates] = useState(mockLogs)
	return (
		<SettingsSection title='تنظیمات ثبت لاگ'>
			{templates.map((template, index) => (
				<SettingsCard key={index} data={template} title={titleMap[template.key]}>
					<EditLogging template={template} setTemplate={setTemplates} title={titleMap[template.key]} />
				</SettingsCard>
			))}
		</SettingsSection>
	)
}

export default Logging
