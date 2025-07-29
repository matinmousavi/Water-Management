import { Flex, Tabs, Typography } from 'antd'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import groupIcon from '../../../assets/icons/Group.svg'
import LandsGroup from './components/LandsGroup/LandsGroup'
import NotesGroup from './components/NotesGroup/NotesGroup'
const Groups = () => {
	const items = [
		{
			key: 'logs',
			label: 'لاگ توزیع',
			children: <></>,
		},
		{
			key: 'lands',
			label: 'زمین ها',
			children: <LandsGroup />,
		},
		{
			key: 'notes',
			label: 'یادداشت ها',
			children: <NotesGroup />,
		},
	]

	return (
		<>
			<MetaTitle>گروه ها</MetaTitle>
			<Flex gap={20} vertical>
				<Flex gap={8} justify='center' align='center'>
					<img src={groupIcon} alt='icon' />
					<Typography.Title level={2} className='text-h2'>
						گروه مزارع شرقی
					</Typography.Title>
				</Flex>

				<Tabs defaultActiveKey='lands' centered items={items} />
			</Flex>
		</>
	)
}

export default Groups
