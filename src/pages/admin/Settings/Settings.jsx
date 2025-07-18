import { Flex } from 'antd'
import BreadCrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import Logging from './components/Logging/Logging'
import Notifications from './components/Notifications/Notifications'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'

const Settings = () => {
	const api = useAPI()
	api.init('messageTemplates')

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical gap={16}>
			<BreadCrumbs />
			<Flex vertical gap={40}>
				<Logging />
				<Notifications api={api} />
			</Flex>
		</Flex>
	)
}

export default Settings
