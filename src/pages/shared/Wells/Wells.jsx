import { Button, Flex, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'

import Loading from '../../../components/Loading/Loading'
import WellsTable from './components/TableWells/WellsTable'
import WellModal from '../../../components/Well/WellModal/WellModal'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import { useUser } from '../../../contexts/UserContext'
import ModalController from '../../../components/ModalController/ModalController'

const { Title } = Typography

const Wells = () => {
	const { user, isAdmin } = useUser()

	const api = useAPI()
	isAdmin ? api.init('wells') : api.init('wells', { irrigator: user._id })

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical className='main-container'>
			<Breadcrumbs />
			<Flex justify='space-between' align='center'>
				<Title level={1} className='text-page-title'>
					لیست چاه‌ها ({api.data.wells.length})
				</Title>

				{isAdmin && (
					<ModalController>
						<ModalController.Trigger>
							<Button type='primary'>افزودن چاه</Button>
						</ModalController.Trigger>

						<ModalController.Modal>
							<WellModal type='add' api={api} />
						</ModalController.Modal>
					</ModalController>
				)}
			</Flex>

			<WellsTable data={api.data.wells} />
		</Flex>
	)
}

export default Wells
