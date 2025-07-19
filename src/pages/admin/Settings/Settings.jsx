import { Flex } from 'antd'
import BreadCrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import Logging from './components/Logging/Logging'
import Notifications from './components/Notifications/Notifications'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import BroadcastNotification from './components/BroadcastNotification/BroadcastNotification'

const settingsMeta = {
	otp: {
		title: 'اطلاع رسانی کد تایید',
		description:
			'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از  طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و  سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با  نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان  خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.',
	},
	irrigation_start_irrigator: {
		title: 'اطلاع‌رسانی آب‌رسانی - شروع آب‌رسانی برای میرآب',
		description:
			'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از  طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و  سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با  نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان  خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.',
	},
	irrigation_end_irrigator: {
		title: 'اطلاع‌رسانی آب‌رسانی - پایان آب‌رسانی برای میرآب',
		description:
			'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از  طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و  سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با  نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان  خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.',
	},
	irrigation_start_landowner: {
		title: 'اطلاع‌رسانی آب‌رسانی - شروع آب‌رسانی برای مالک زمین',
		description:
			'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از  طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و  سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با  نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان  خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.',
	},
	irrigation_end_landowner: {
		title: 'اطلاع‌رسانی آب‌رسانی - پایان آب‌رسانی برای مالک زمین',
		description:
			'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از  طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و  سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با  نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان  خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.',
	},
	descriptionEdit: {
		title: 'امکان ویرایش توضیحات لاگ توسط میرآب',
		description: 'ساعت پس از ثبت لاگ',
	},
	log_operator_time_limit: {
		title: 'محدودیت در زمان ثبت لاگ آبرسانی',
		description: 'دقیقه پیش از زمان ثبت لاگ',
	},
	public_information_registration: {
		title: 'ثبت اطلاع رسانی همگانی',
		description: 'ثبت و ارسال اطلاع‌رسانی عمومی برای کاربران از طریق پیامک یا سایر روش‌ها.',
	},
}

const Settings = () => {
	const api = useAPI()
	api.init('settings')

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical gap={16}>
			<BreadCrumbs />
			<Flex vertical gap={40}>
				<Logging data={api?.data?.settings?.irrigationLog} meta={settingsMeta} />
				<Notifications data={api?.data?.settings?.messageTemplates} meta={settingsMeta} />
				<BroadcastNotification
					title={settingsMeta?.public_information_registration?.title}
					description={settingsMeta?.public_information_registration?.description}
				/>
			</Flex>
		</Flex>
	)
}

export default Settings
