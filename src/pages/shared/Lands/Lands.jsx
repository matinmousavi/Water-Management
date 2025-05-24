import { Card, Flex, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import LandsList from './components/LandsList/LandsList'
import AddLandModal from './components/AddLandModal/AddLandModal'
import { useEffect, useState } from 'react'

const Lands = () => {
	const [refetch, setRefetch] = useState(false)
	const { Title } = Typography
	const { init, data, get } = useAPI()
	init('lands')
	useEffect(() => {
		const getLadns = async () => {
			try {
				await get('lands')
			} catch (error) {
				console.log(error.error.message)
			}
		}
		getLadns()
	}, [refetch])
	return (
		<Flex vertical gap={10}>
			<Flex align='center' justify='space-between'>
				<Title level={1} className='text-h1'>
					لیست زمین ها
				</Title>
				<AddLandModal refetchLands={() => setRefetch(!refetch)} />
			</Flex>
			<Card>
				<LandsList data={data?.lands} />
			</Card>
		</Flex>
	)
}
export default Lands
