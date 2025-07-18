import SettingsCard from '../SettingsSection/SettingsCard/SettingsCard'
import SettingsSection from '../SettingsSection/SettingsSection'

const mockLogs = [
	{
		key: 'log_change_description',
		text: '۲۴ ساعت پس از ثبت لاگ',
		placeholders: [],
	},
	{
		key: 'log_operator_time_limit',
		text: 'محدودیت در زمان ثبت لاگ آبرسانی',
		placeholders: [],
	},
]

const Logging = () => {
	return (
		<SettingsSection title='تنظیمات ثبت لاگ'>
			{mockLogs.map((log, index) => (
				<SettingsCard key={index} data={log} />
			))}
		</SettingsSection>
	)
}

export default Logging
