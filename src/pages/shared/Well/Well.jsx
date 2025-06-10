import { useEffect, useState } from 'react'
import { Flex, Tag, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import Loading from '../../../components/Loading/Loading'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'
import WellInfoCard from './components/WellInfoCard/WellInfoCard'
import WellLandsCard from './components/WellLandsCard/WellLandsCard'
import WellLogCard from './components/WellLogsCard/WellLogsCard'
import { useUser } from '../../../contexts/UserContext'
import { EditOutlined } from '@ant-design/icons'

const Well = () => {
	const { wellId } = useParams()
	const api = useAPI()
	const { isAdmin } = useUser()

	const [title, setPageTitle] = useState('')
	const [logs, setLogs] = useState([])

	if (wellId) api.init(`wells/${wellId}`)

	useEffect(() => {
		if (api.data?.well) {
			setPageTitle(api.data.well.title)
			setLogs(api.data.well.logs || [])
		}
	}, [api.data?.well])

	if (api.isLoading || !api.data?.well) return <Loading />

	return (
		<>
			<MetaTitle>ویرایش چاه</MetaTitle>

			<Flex vertical>
				<Breadcrumbs data={api.data?.well} />

				<Flex align='center' gap={16}>
					<BackButton backTo='/wells' />
					<Typography.Title className='text-page-title'>{title}</Typography.Title>
					<Tag color='green'>
						<Flex align='center' gap={3}>
							فعال <EditOutlined />
						</Flex>
					</Tag>
				</Flex>

				<WellInfoCard wellInfo={api.data?.well} setPageTitle={setPageTitle} />

				<WellLandsCard wellLands={api.data?.well?.lands} />

				<WellLogCard wellLogs={logs} setLogs={setLogs} />

				{isAdmin && <DeleteCard title='چاه' api={`wells/${wellId}`} backTo='/wells' />}
			</Flex>
		</>
	)
}

export default Well
