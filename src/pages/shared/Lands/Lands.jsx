import { Flex, Grid, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/common/Loading/Loading'
import LandsTable from './components/LandsTable/LandsTable'
import { useUser } from '../../../contexts/UserContext'
import AddLand from './components/AddLand/AddLand'

const Lands = () => {
	const { isAdmin } = useUser()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const api = useAPI()
	api.init('lands')

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical className='main-container' gap={isMobile && 16}>
			<Flex justify='space-between' align='center'>
				<Typography.Title level={1} className='text-page-title'>
					زمین‌ها ({api.data.lands.length}){' '}
				</Typography.Title>
				{isAdmin && <AddLand setData={api.setData} />}
			</Flex>

			<LandsTable landsData={api.data.lands} />
		</Flex>
	)
}

export default Lands
