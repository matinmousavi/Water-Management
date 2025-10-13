import { Card, Flex, Typography } from 'antd'
import LandLogsTable from './components/LandLogsTable/LandLogsTable'
import AddIrrigationLog from '../../../../../components/irrigation/AddIrrigationLog/AddIrrigationLog'

const { Title } = Typography

const LandLogsCard = ({ landLogs, setLogs, defaultWell, allWells, landId, status }) => {
	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-card-title'>
						لاگ توزیع آب ({landLogs.length})
					</Title>
					{status === 'active' && <AddIrrigationLog page='land' defaultWell={defaultWell} allWells={allWells} landId={landId} setLogs={setLogs} />}
				</Flex>
				{landLogs.length > 0 && <LandLogsTable data={landLogs} setLogs={setLogs} wellId={defaultWell?._id} status={status} />}
			</Flex>
		</Card>
	)
}

export default LandLogsCard
