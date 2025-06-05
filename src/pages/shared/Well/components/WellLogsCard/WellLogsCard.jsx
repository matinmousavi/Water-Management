import { Card, Flex, Typography } from 'antd'
import { useParams } from 'react-router'
import WellAddLog from './components/WellAddLog/WellAddLog'
import WellLogsTable from './components/WellLogsTable/WellLogsTable'
const { Title } = Typography

const WellLogsCard = ({ wellLogs }) => {
	const { wellId } = useParams()

	return (
		<>
			<Card>
				<Flex vertical gap={(0, 40)}>
					<Flex align='center' justify='space-between'>
						<Title level={2} className='text-card-title'>
							لاگ توزیع آب ({wellLogs?.length})
						</Title>
						<WellAddLog wellId={wellId} />
					</Flex>
					<WellLogsTable />
				</Flex>
			</Card>
		</>
	)
}

export default WellLogsCard
