import { Flex, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import WellsTable from './components/TableWells/WellsTable'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import { useUser } from '../../../contexts/UserContext'
import AddWell from './components/AddWell/AddWell'

const Wells = () => {
	const { user, isAdmin } = useUser()

	const api = useAPI()
	isAdmin ? api.init('wells') : api.init('wells', { irrigator: user._id })

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical className='main-container'>
			<Breadcrumbs />
			<Flex className='heading-container' justify='space-between' align='center'>
				<Typography.Title level={1} className='text-page-title'>
					لیست چاه‌ها ({api.data.wells.length})
				</Typography.Title>

				{isAdmin && <AddWell setData={api.setData} />}
			</Flex>

			<WellsTable WellsData={api.data.wells} />
		</Flex>
	)
}

export default Wells
