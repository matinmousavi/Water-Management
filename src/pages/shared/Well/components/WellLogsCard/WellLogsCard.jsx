import { Card, Flex, Typography } from 'antd'
import WellLogsTable from './components/WellLogsTable/WellLogsTable'
import AddIrrigationLog from '../../../../../components/AddIrrigationLog/AddIrrigationLog'

const { Title } = Typography

const WellLogsCard = ({ data, wellId, setLogs , title}) => {
	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-card-title'>
						لاگ توزیع آب ({data.length})
					</Title>
					<AddIrrigationLog page='well' wellId={wellId} setLogs={setLogs} />
				</Flex>
				{data.length > 0 && <WellLogsTable data={data} setLogs={setLogs} wellId={wellId} title={title} />}
			</Flex>
		</Card>
	)
}

export default WellLogsCard
