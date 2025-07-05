import { Card, Flex, Typography } from 'antd'
import LandLogsTable from './components/LandLogsTable/LandLogsTable'
import AddIrrigationLog from '../../../../../components/AddIrrigationLog/AddIrrigationLog'

const { Title } = Typography

const LandLogsCard = ({ landLogs, setLogs, well, landId }) => {
	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-card-title'>
						لاگ توزیع آب ({landLogs.length})
					</Title>
					<AddIrrigationLog page='land' wellId={well?.[0]?._id} landId={landId} setLogs={setLogs} />
				</Flex>
				{landLogs.length > 0 && <LandLogsTable data={landLogs} setLogs={setLogs} wellId={well?.[0]?._id} />}
			</Flex>
		</Card>
	)
}

export default LandLogsCard
