import { Flex } from 'antd'
import BreadCrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import Irrigations from './components/Irrigations/Irrigations'
import Notifications from './components/Notifications/Notifications'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import BroadcastNotification from './components/BroadcastNotification/BroadcastNotification'

const Settings = () => {
	const api = useAPI()
	api.init('settings')

	console.log(api.data)

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical gap={16}>
			<BreadCrumbs />
			<Flex vertical gap={40}>
				<Irrigations data={api?.data?.settings?.irrigations} />
				<Notifications data={api?.data?.settings?.messageTemplates} />
				<BroadcastNotification />
			</Flex>
		</Flex>
	)
}

export default Settings
