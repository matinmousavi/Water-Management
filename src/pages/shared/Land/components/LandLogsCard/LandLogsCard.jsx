import { Card, Flex, Typography } from 'antd'
import LandAddLog from './components/LandAddLog/LandAddLog'
import LandLogsTable from './components/LandLogsTable/LandLogsTable'
import { useParams } from 'react-router'

const { Title } = Typography

const LandLogsCard = ({ landLogs, setLogs, well }) => {
	const { wellId } = useParams()

	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-card-title'>
						لاگ توزیع آب ({landLogs.length})
					</Title>
					<LandAddLog wellId={well._id || wellId} setLogs={setLogs} />
				</Flex>
				{landLogs.length > 0 && <LandLogsTable data={landLogs} setLogs={setLogs} wellId={wellId} />}
			</Flex>
		</Card>
	)
}

export default LandLogsCard
