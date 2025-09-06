import { Flex, Tabs, Typography, Grid } from 'antd'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import groupIcon from '../../../assets/icons/Group.svg'
import LandsGroup from './components/LandsGroup/LandsGroup'
import NotesGroup from './components/NotesGroup/NotesGroup'
import LogsGroup from './components/LogsGroup/LogsGroup'
import GroupDesktop from './components/GroupDesktop/GroupDesktop'
import { useParams } from 'react-router'
import useAPI from '../../../hooks/useAPI'
import HeaderIrrigation from '../../../components/HeaderIrrigation/HeaderIrrigation'
const Groups = () => {
	const { wellId, groupId } = useParams()
	const landApi = useAPI()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs
	landApi.init(`lands`)
	const wellApi = useAPI()
	wellApi.init(`wells/${wellId}`)
	const well = wellApi.data?.well

	const items = [
		{
			key: 'logs',
			label: 'لاگ توزیع',
			children: <LogsGroup data={well?.logs} wellId={wellId} />,
		},
		{
			key: 'lands',
			label: 'زمین ها',
			children: <LandsGroup data={well?.lands} />,
		},
		{
			key: 'notes',
			label: 'یادداشت ها',
			children: <NotesGroup groupId={groupId} />,
		},
	]

	return (
		<>
			<MetaTitle>گروه ها</MetaTitle>
			{isMobile ? (
				<Flex gap={20} vertical>
					<HeaderIrrigation title={`گروه ${well?.landGroups[0]?.title}`} icon={groupIcon} />
					<Tabs defaultActiveKey='lands' centered items={items} />
				</Flex>
			) : (
				<GroupDesktop groupId={groupId} wellId={wellId} data={well} />
			)}
		</>
	)
}

export default Groups
