import { Flex } from 'antd'
import BreadCrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import Logging from './components/Logging/Logging'
import Notifications from './components/Notifications/Notifications'

const Settings = () => {
	return (
		<>
			<BreadCrumbs />
			<Flex vertical gap={40}>
				<Logging />
				<Notifications />
			</Flex>
		</>
	)
}

export default Settings
