import useAPI from '../../../hooks/useAPI'
import { Flex, Grid, Typography } from 'antd'
import Loading from '../../../components/Loading/Loading'
import MessageSender from './components/MessageSender/MessageSender'
import SentNotificationsTable from './components/SentNotificationsTable/SentNotificationsTable'

const SendNotification = () => {
	const api = useAPI()
	const { useBreakpoint } = Grid;
	const screens = useBreakpoint();
	const isMobile = screens.xs;

	api.init('notifications')

	if (api.isLoading) return <Loading />

	return (
		<Flex vertical className='main-container' gap={isMobile && 16}>
			<Flex justify='space-between' align='center'>
				<Typography.Title level={1} className='text-page-title'>
					پیامک‌های ارسال‌شده
				</Typography.Title>
				<MessageSender api={api} />
			</Flex>

			<SentNotificationsTable data={api.data.data} />
		</Flex>
	)
}

export default SendNotification
