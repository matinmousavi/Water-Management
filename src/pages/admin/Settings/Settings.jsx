import { Flex } from 'antd'
import BreadCrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import Logging from './components/Logging/Logging'
import Notifications from './components/Notifications/Notifications'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import BroadcastNotification from './components/BroadcastNotification/BroadcastNotification'

const titleMap = {
	otp: 'اطلاع رسانی کد تایید',
	irrigation_start_irrigator: 'اطلاع‌رسانی آب‌رسانی - شروع آب‌رسانی برای میرآب',
	irrigation_end_irrigator: 'اطلاع‌رسانی آب‌رسانی - پایان آب‌رسانی برای میرآب',
	irrigation_start_landowner: 'اطلاع‌رسانی آب‌رسانی - شروع آب‌رسانی برای مالک زمین',
	irrigation_end_landowner: 'اطلاع‌رسانی آب‌رسانی - پایان آب‌رسانی برای مالک زمین',
	log_change_description: 'امکان ویرایش توضیحات لاگ توسط میرآب',
	log_operator_time_limit: 'محدودیت در زمان ثبت لاگ آبرسانی',
	public_information_registration: 'ثبت اطلاع رسانی همگانی',
}

const mockLogs = [
	{
		key: 'log_change_description',
		text: '۲۴ ساعت پس از ثبت لاگ',
		placeholders: [],
		time: '۲۴',
	},
	{
		key: 'log_operator_time_limit',
		text: '۳۰ دقیقه پیش از زمان ثبت لاگ',
		placeholders: [],
		time: '۳۰',
	},
	{
		key: 'public_information_registration',
		text: 'متن تستی برای اطلاع رسانی همگانی',
		placeholders: [],
		time: '22',
	},
]

const Settings = () => {
	const api = useAPI()
	api.init('messageTemplates')

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical gap={16}>
			<BreadCrumbs />
			<Flex vertical gap={40}>
				<Logging mockLogs={mockLogs} titleMap={titleMap} />
				<Notifications api={api} titleMap={titleMap} />
				<BroadcastNotification mockLogs={mockLogs} titleMap={titleMap} />
			</Flex>
		</Flex>
	)
}

export default Settings
