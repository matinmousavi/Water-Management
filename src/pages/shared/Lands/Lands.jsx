import { Flex, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import LandsList from './components/LandsList/LandsList'
import AddLandModal from './components/AddLandModal/AddLandModal'
import { useEffect, useState } from 'react'
import Loading from '../../../components/Loading/Loading'

const Lands = () => {
	const [landsData, setLandsData] = useState()
	const { Title } = Typography
	const landsApi = useAPI()

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await landsApi.get('lands')
				setLandsData(data?.lands)
			} catch (error) {
				console.error('Error fetching lands data:', error)
			}
		}

		fetchData()
	}, [])

	if (landsApi.isLoading || !landsApi.data) {
		return <Loading />
	}

	return (
		<Flex vertical gap={10}>
			<Flex align='center' justify='space-between'>
				<Title level={1} className='text-h1'>
					زمین ها
				</Title>
				<AddLandModal setLandsData={setLandsData} />
			</Flex>
			<LandsList landsData={landsData} />
		</Flex>
	)
}
export default Lands
