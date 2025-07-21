import useAPI from '../../../hooks/useAPI'
import { Flex, Typography } from 'antd'
import Loading from '../../../components/Loading/Loading'
import MessageSender from './components/MessageSender/MessageSender'
import SentNotificationsTable from './components/SentNotificationsTable/SentNotificationsTable'

const SendNotification = () => {
	const api = useAPI()

	api.init('notifications')

	if (api.isLoading) return <Loading />

	return (
		<Flex vertical className='main-container'>
			<Flex justify='space-between' align='center'>
				<Typography.Title level={1} className='text-page-title'>
					پیامک های ارسال شده
				</Typography.Title>
				<MessageSender api={api} />
			</Flex>

			<SentNotificationsTable data={api.data.data} />
		</Flex>
	)
}

export default SendNotification
