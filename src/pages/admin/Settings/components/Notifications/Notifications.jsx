import { useState } from 'react'
import Loading from '../../../../../components/Loading/Loading'
import SettingsCard from '../SettingsSection/SettingsCard/SettingsCard'
import SettingsSection from '../SettingsSection/SettingsSection'
import EditNotification from './EditNotification/EditNotification'

const Notifications = ({ api, titleMap }) => {
	const [templates, setTemplates] = useState(api?.data?.templates || [])
	if (api.isLoading || !api.data) return <Loading />
	return (
		<SettingsSection title='تنظیمات اطلاع‌رسانی'>
			{templates.map((template, index) => (
				<SettingsCard key={index} data={template} title={titleMap[template.key]}>
					<EditNotification template={template} setTemplate={setTemplates} title={titleMap[template.key]} />
				</SettingsCard>
			))}
		</SettingsSection>
	)
}

export default Notifications
