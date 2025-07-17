import NotificationCard from '../SettingsSection/NotificationCard/NotificationCard'
import SettingsSection from '../SettingsSection/SettingsSection'

const mockLogs = [
	{
		key: 'log_change_description',
		text: 'امکان تغییر توضیحات لاگ توسط صیاد تا ۲۴ ساعت پس از ثبت',
		placeholders: [],
	},
	{
		key: 'log_operator_time_limit',
		text: 'محدودیت در زمان ثبت لاگ توسط اپراتور تا ۳۰ دقیقه',
		placeholders: [],
	},
]

const Logging = () => {
	return (
		<SettingsSection title='تنظیمات ثبت لاگ'>
			{mockLogs.map((log, index) => (
				<NotificationCard key={index} data={log} />
			))}
		</SettingsSection>
	)
}

export default Logging
