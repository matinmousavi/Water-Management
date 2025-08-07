import { Card, Flex, Typography } from 'antd'
import useAPI from '../../../../../../../hooks/useAPI'
import WellLandsTable from './components/WellLandsTable/WellLandsTable'
import React from 'react'
import { useParams } from 'react-router'
import { useUser } from '../../../../../../../contexts/UserContext'
import WellAddLand from './components/WellAddLand/WellAddLand'
import WellAddLandsGroup from './components/WellAddLandsGroup/WellAddLandGroup'

const WellLandsCard = ({ wellLands, wellStatus, landGroups, setLandsData }) => {
	const api = useAPI()
	const { wellId } = useParams()
	const { isAdmin } = useUser()

	const rawLands = api.data.lands || wellLands
	const lands = Array.from(new Map(rawLands.map(item => [item._id, item])).values())

	return (
		<Card>
			<Flex vertical gap={40}>
				<Flex align='center' justify='space-between'>
					<Typography.Title level={2} className='text-card-title'>
						لیست زمین ها ({lands?.length})
					</Typography.Title>
					{isAdmin && wellStatus === 'active' && (
						<Flex>
							{lands.length > 0 && <WellAddLandsGroup currentLands={lands} setLandsData={setLandsData} landGroups={landGroups} />}
							<WellAddLand currentLands={lands} setLandsData={setLandsData} />
						</Flex>
					)}
				</Flex>
				{lands?.length > 0 && <WellLandsTable data={lands} setData={setLandsData} wellId={wellId} landGroups={landGroups} />}
			</Flex>
		</Card>
	)
}

export default React.memo(WellLandsCard)
