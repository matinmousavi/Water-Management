import Loading from '../../../../../components/Loading/Loading'
import useAPI from '../../../../../hooks/useAPI'
import NotificationCard from '../SettingsSection/NotificationCard/NotificationCard'
import SettingsSection from '../SettingsSection/SettingsSection'

const Notifications = () => {
	const api = useAPI()
	api.init('messageTemplates')

	if (api.isLoading || !api.data) return <Loading />

	const notificationTemplates = api.data.templates.filter(item => item.key !== 'otp')

	return (
			<SettingsSection title='تنظیمات اطلاع‌رسانی'>
				{notificationTemplates.map((template, index) => (
					<NotificationCard key={index} data={template} />
				))}
			</SettingsSection>
	)
}

export default Notifications
