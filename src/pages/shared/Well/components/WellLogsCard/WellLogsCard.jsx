import { Card, Flex, Typography, Grid } from 'antd'
import WellAddLog from './components/WellAddLog/WellAddLog'
import WellLogsTable from './components/WellLogsTable/WellLogsTable'
import WellLogsMobile from '../WellLogsMobile/WellLogsMobile'

const { Title } = Typography

const WellLogsCard = ({ wellLogs, wellId, setLogs }) => {
	return (
		<Card>
			<Flex vertical gap={40}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-card-title'>
						لاگ توزیع آب ({wellLogs.length})
					</Title>
					<WellAddLog wellId={wellId} setLogs={setLogs} />
				</Flex>
				{wellLogs.length > 0 && <WellLogsTable data={wellLogs} setLogs={setLogs} wellId={wellId} />}
			</Flex>
		</Card>
	)
}

export default WellLogsCard
