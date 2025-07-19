import { useState } from 'react'
import SettingsCard from '../SettingsSection/SettingsCard/SettingsCard'
import SettingsSection from '../SettingsSection/SettingsSection'
import EditLogging from './EditLogging/EditLogging'
import english2persian from '../../../../../utils/english2persian'

const Logging = ({ data, meta }) => {
	const [templates, setTemplates] = useState(data)
	return (
		<SettingsSection title='تنظیمات ثبت لاگ'>
			{templates.map((template, index) => (
				<SettingsCard key={index} title={meta[template.key]?.title} description={`${english2persian(String(template.time))} ${meta[template.key]?.description}`}>
					<EditLogging template={template} setTemplate={setTemplates} title={meta[template.key]?.title} />
				</SettingsCard>
			))}
		</SettingsSection>
	)
}

export default Logging
