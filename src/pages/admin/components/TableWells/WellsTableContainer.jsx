import { Button, Card, Flex, Typography } from 'antd'
import { useEffect, useState } from 'react'
import AddWell from '../AddWell/AddWell'
import useAPI from '../../../../hooks/useAPI'
import WellsTable from './WellsTable'
import Loading from '../../../../components/Loading/Loading'

const { Title } = Typography

const WellsTableContainer = () => {
	const wellApi = useAPI()
	const [isModalOpenFormUser, setIsModalOpenFormUser] = useState(false)
	const [isRenderList, setIsRenderList] = useState(false)

	wellApi.init('wells')
	useEffect(() => {
		wellApi.get('wells')
	}, [isRenderList])

	const showModal = () => {
		setIsModalOpenFormUser(true)
	}

	if (wellApi.isLoading) {
		return <Loading />
	}
	return (
		<Flex vertical>
			<Flex justify='space-between' style={{ marginBottom: '10px' }}>
				<Title level={1} className='text-h1'>
					لیست چاه ها
				</Title>
				<Button onClick={showModal} type='primary'>
					افزودن چاه
				</Button>
			</Flex>
			<Card>
				<WellsTable data={wellApi?.data?.wells} />
				<AddWell setIsRenderList={setIsRenderList} isOpen={isModalOpenFormUser} setIsOpen={setIsModalOpenFormUser} />
			</Card>
		</Flex>
	)
}

export default WellsTableContainer
