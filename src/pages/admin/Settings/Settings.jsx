import { Flex } from 'antd'
import Irrigations from './components/Irrigations/Irrigations'
import Notifications from './components/Notifications/Notifications'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/common/Loading/Loading'

const Settings = () => {
	const api = useAPI()
	api.init('settings')

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical gap={16}>
			<Flex vertical gap={40}>
				<Irrigations data={api?.data?.settings?.irrigations} />
				<Notifications data={api?.data?.settings?.messageTemplates} />
			</Flex>
		</Flex>
	)
}

export default Settings
