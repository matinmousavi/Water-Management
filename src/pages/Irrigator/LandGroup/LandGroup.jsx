import { Flex, Tabs, Grid } from 'antd'
import MetaTitle from '../../../components/common/MetaTitle/MetaTitle'
import groupIcon from '../../../assets/icons/Group.svg'
import GroupDesktop from './components/GroupDesktop/GroupDesktop'
import { useParams } from 'react-router'
import useAPI from '../../../hooks/useAPI'
import HeaderIrrigation from '../../../components/irrigation/HeaderIrrigation/HeaderIrrigation'
import Loading from '../../../components/common/Loading/Loading'
import IrrigationLogsMobile from '../../../components/responsive/mobile/IrrigationLogsMobile/IrrigationLogsMobile'
import LandGroupLands from './components/LandGroupLands/LandGroupLands'
import LandGroupNotes from './components/LandGroupNotes/LandGroupNotes'

const LandGroup = () => {
	const { wellId, groupId } = useParams()
	const landGroupApi = useAPI()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	landGroupApi.init(`wells/${wellId}/land-groups/${groupId}`)

	const landGroupData = landGroupApi.data

	if (landGroupApi.isLoading) return <Loading />

	const items = [
		{
			key: 'logs',
			label: 'لاگ توزیع',
			children: (
				<IrrigationLogsMobile
					entityType='landGroup'
					entityId={groupId}
					wellId={wellId}
					initialLogs={landGroupData.logs}
					receivedWater={landGroupData.receivedWater}
					requiredWater={landGroupData.requiredWater}
					remainingWater={landGroupData.remainingWater}
				/>
			),
		},
		{
			key: 'lands',
			label: 'زمین ها',
			children: <LandGroupLands lands={landGroupData?.lands} group={landGroupData} />,
		},
		{
			key: 'notes',
			label: 'یادداشت ها',
			children: <LandGroupNotes groupId={groupId} />,
		},
	]

	return (
		<>
			<MetaTitle>گروه ها</MetaTitle>
			{isMobile ? (
				<Flex gap={20} vertical>
					<HeaderIrrigation title={`گروه ${landGroupData?.title}`} icon={groupIcon} />
					<Tabs defaultActiveKey='lands' centered items={items} />
				</Flex>
			) : (
				<GroupDesktop groupId={groupId} wellId={wellId} logs={landGroupData?.logs} data={landGroupData} />
			)}
		</>
	)
}

export default LandGroup
