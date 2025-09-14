import { Flex, Tabs, Typography } from 'antd'
import BackButton from '../../../../../components/BackButton/BackButton'
import styels from './GroupDesktop.module.css'
import GroupLandsList from './components/GroupLandsList/GroupLandsList'
import GroupLogs from './components/GroupLogs/GroupLogs'
import GroupNotes from './components/GroupNotes/GroupNotes'

const GroupDesktop = ({ data, logs, groupId, wellId }) => {
	const { Title } = Typography

	const items = [
		{
			key: 'logs',
			label: 'لاگ توزیع',
			children: <GroupLogs logs={logs} wellId={wellId} groupId={groupId} />,
		},
		{
			key: 'lands',
			label: 'زمین ها',
			children: <GroupLandsList lands={data?.lands} group={data} />,
		},
		{
			key: 'notes',
			label: 'یادداشت ها',
			children: <GroupNotes groupId={groupId} />,
		},
	]

	return (
		<Flex vertical gap={16}>
			<Flex vertical className='heading-container' justify='space-etween'>
				<Flex align='center' gap={16}>
					<BackButton backTo={''} />
					<Title level={1} className='text-h3'>
						{data?.title || 'گروه'}
					</Title>
				</Flex>
				<Tabs className={styels.tabContainer} items={items} />
			</Flex>
		</Flex>
	)
}

export default GroupDesktop
