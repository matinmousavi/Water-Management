import SettingsCard from '../SettingsSection/SettingsCard/SettingsCard'
import SettingsSection from '../SettingsSection/SettingsSection'

const Notifications = ({ api }) => {
	const notificationTemplates = api.data.templates.filter(item => item.key !== 'otp')
	console.log(notificationTemplates);
	

	return (
		<SettingsSection title='تنظیمات اطلاع‌رسانی'>
			{notificationTemplates.map((template, index) => (
				<SettingsCard key={index} data={template} />
			))}
		</SettingsSection>
	)
}

export default Notifications
