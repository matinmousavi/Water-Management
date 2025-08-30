import { Flex, Grid, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import WellsTable from './components/TableWells/WellsTable'
import { useUser } from '../../../contexts/UserContext'
import AddWell from './components/AddWell/AddWell'

const Wells = () => {
	const { user, isAdmin } = useUser()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const wellsApi = useAPI()
	isAdmin
		? wellsApi.init(`wells`)
		: wellsApi.init('wells', {
				filters: { irrigator: user._id },
		  })
	if (!wellsApi.data) return <Loading />

	return (
		<Flex vertical className='main-container' gap={isMobile && 16}>
			<Flex className='heading-container' justify='space-between' align='center'>
				<Typography.Title level={1} className='text-page-title'>
					لیست چاه‌ها ({wellsApi.data.wells.length})
				</Typography.Title>

				{isAdmin && <AddWell wellsApi={wellsApi} />}
			</Flex>

			<WellsTable WellsData={wellsApi.data.wells} />
		</Flex>
	)
}

export default Wells
