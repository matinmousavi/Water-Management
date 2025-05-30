import { useEffect, useState } from 'react'
import { Button, Flex, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import Loading from '../../../components/Loading/Loading'
import WellsTable from './components/TableWells/WellsTable'
import WellModal from '../../../components/Well/WellModal/WellModal'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'

const { Title } = Typography

const Wells = () => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const [wells, setWells] = useState([])
	const [isModalOpen, setIsModalOpen] = useState(false)

	const fetchWells = async () => {
		const res = await wellApi.get('wells')
		if (res.error) {
			openNotification('error', 'خطا', res.message)
		} else {
			setWells(res.wells || [])
		}
	}

	useEffect(() => {
		fetchWells()
	}, [])

	if (wellApi.isLoading) return <Loading />

	return (
		<Flex vertical className='main-container'>
			<Breadcrumbs />
			<Flex justify='space-between' style={{ marginBottom: 10 }}>
				<Title level={1} className='text-page-title'>
					لیست چاه‌ها ({wells.length})
				</Title>
				<Button type='primary' onClick={() => setIsModalOpen(true)}>
					افزودن چاه
				</Button>
			</Flex>

			<WellsTable data={wells} />

			<WellModal type='add' isOpen={isModalOpen} setIsOpen={setIsModalOpen} setWellsData={setWells} />
		</Flex>
	)
}

export default Wells
