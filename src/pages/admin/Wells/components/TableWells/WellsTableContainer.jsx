import { Button, Flex } from 'antd'
import { useEffect, useState } from 'react'
import AddWell from '../AddWell/AddWell'
import useAPI from '../../../../../hooks/useAPI'
import WellsTable from './WellsTable'
import Loading from '../../../../../components/Loading/Loading'

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
				<h1>لیست چاه ها ({wellApi?.data?.wells?.length})</h1>
				<Button onClick={showModal} type='primary'>
					افزودن چاه
				</Button>
			</Flex>
			<div>
				<WellsTable data={wellApi?.data?.wells} />
				<AddWell setIsRenderList={setIsRenderList} isOpen={isModalOpenFormUser} setIsOpen={setIsModalOpenFormUser} />
			</div>
		</Flex>
	)
}

export default WellsTableContainer
