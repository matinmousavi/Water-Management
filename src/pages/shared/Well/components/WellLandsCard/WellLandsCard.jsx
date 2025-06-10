import { Card, Flex, Typography } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import WellLandsTable from './components/WellLandsTable/WellLandsTable'
import React from 'react'
import { useParams } from 'react-router'
import { useUser } from '../../../../../contexts/UserContext'
import WellAddLand from './components/WellAddLand/WellAddLand'
import styles from './WellLandsCard.module.css'
import WellLandsMobile from './components/WellLandsMobile/WellLandsMobile'

const WellLandsCard = ({ wellLands }) => {
	const api = useAPI()
	const { wellId } = useParams()
	const { isAdmin } = useUser()

	const lands = api.data.lands || wellLands

	return (
		<>
			<Card className={styles.landsContainer}>
				<Flex vertical gap={(0, 40)}>
					<Flex align='center' justify='space-between'>
						<Typography.Title level={2} className='text-card-title'>
							لیست زمین ها ({lands?.length})
						</Typography.Title>
						{isAdmin && <WellAddLand lands={lands} setLandsData={api.setData} />}
					</Flex>
					{lands.length > 0 && <WellLandsTable data={lands} setData={api.setData} wellId={wellId} />}
				</Flex>
			</Card>
			<Flex vertical gap={16}>
				{lands.map((item, index) => (
					<WellLandsMobile key={index} data={item} />
				))}
			</Flex>
		</>
	)
}
export default React.memo(WellLandsCard)
