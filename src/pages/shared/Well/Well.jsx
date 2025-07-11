import { useEffect, useState } from 'react'
import { Typography, Grid, Flex } from 'antd'

import { useParams } from 'react-router'

import useAPI from '../../../hooks/useAPI'
import { useUser } from '../../../contexts/UserContext'

import Loading from '../../../components/Loading/Loading'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'
import WellInfoCard from './components/WellInfoCard/WellInfoCard'
import WellLandsCard from './components/WellLandsCard/WellLandsCard'
import WellLogCard from './components/WellLogsCard/WellLogsCard'
import WellLogsMobile from './components/WellLogsMobile/WellLogsMobile'

import iconWell from '../../../assets/icons/Vector.svg'
import WellStatus from './components/WellStatus'

const Well = () => {
	const { wellId } = useParams()
	const api = useAPI()
	const { user, isAdmin } = useUser()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const [title, setTitle] = useState('')
	const [logs, setLogs] = useState([])
	const [status, setStatus] = useState('')

	wellId ? api.init(`wells/${wellId}`) : api.init('wells', { irrigator: user._id })

	useEffect(() => {
		const fetchedWell = api.data?.well || api.data?.wells?.[0]
		if (fetchedWell) {
			setTitle(fetchedWell.title)
			setLogs(fetchedWell.logs || [])
			setStatus(fetchedWell.status)
		}
	}, [api.data?.well])

	if (api.isLoading || (!api.data?.well && !api.data?.wells)) {
		return <Loading />
	}

	const well = api.data?.well || api.data?.wells?.[0]
	const actualWellId = wellId || well?._id

	return (
		<>
			<MetaTitle>{title ? `چاه ${title}` : 'جزئیات چاه'}</MetaTitle>

			<Flex vertical gap='large'>
				{isMobile ? (
					<Flex gap={8} justify='center' align='center'>
						<img src={iconWell} alt='icon' />
						<Typography.Title level={2} className='text-h2'>
							چاه {well?.title}
						</Typography.Title>
					</Flex>
				) : (
					<>
						<Breadcrumbs data={{ title }} />
						<Flex align='center' gap={16}>
							<BackButton backTo='/wells' />
							<Typography.Title className='text-page-title'>{title}</Typography.Title>
							<WellStatus wellId={wellId} status={status} setStatus={setStatus} />
						</Flex>
					</>
				)}

				{isMobile ? (
					<Flex vertical gap={12}>
						{well?.logs?.map(log => (
							<WellLogsMobile key={log._id} data={log} />
						))}
					</Flex>
				) : (
					<>
						<WellInfoCard wellInfo={well} setPageTitle={setTitle} />
						<WellLandsCard wellLands={well?.lands} wellStatus={status} />
						<WellLogCard data={logs} wellId={actualWellId} setLogs={setLogs} title={title} wellStatus={status} />
					</>
				)}

				{isAdmin && <DeleteCard title={`چاه ${title}`} api={`wells/${actualWellId}`} backTo='/wells' />}
			</Flex>
		</>
	)
}

export default Well
