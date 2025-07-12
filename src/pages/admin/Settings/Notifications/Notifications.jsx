import { Flex, Typography } from 'antd'
import BreadCrumbs from '../../../../components/BreadCrumbs/BreadCrumbs'
import useAPI from '../../../../hooks/useAPI'
import Loading from '../../../../components/Loading/Loading'
import styles from './Notifications.module.css'
import NotificationCard from './components/NotificationCard/NotificationCard'
import BroadcastNotification from './components/BroadcastNotification/BroadcastNotification'

const Notifications = () => {
	const api = useAPI()
	api.init('messageTemplates')

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical>
			<BreadCrumbs />
			<Flex className='heading-container' align='center'>
				<Typography.Title level={1} className='text-page-title'>
					تنظیمات اطلاع رسانی
				</Typography.Title>
			</Flex>

			<Flex vertical className={styles.list}>
				{api.data.templates.map((template, index) => (
					<NotificationCard key={index} data={template} />
				))}
			</Flex>
			<BroadcastNotification />
		</Flex>
	)
}

export default Notifications
