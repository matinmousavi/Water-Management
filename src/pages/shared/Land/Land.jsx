import { Flex, Grid, Tag, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import LandInfo from './components/LandInfo/LandInfo'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import BackButton from '../../../components/BackButton/BackButton'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import LandNote from './components/LandNote/LandNote'
import LandLogsCard from './components/LandLogsCard/LandLogsCard'
import { useUser } from '../../../contexts/UserContext'
import styles from './Land.module.css'
import LandMobile from './components/LandMobile/LandMobile'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useNotification from '../../../hooks/useNotification'
import LandStatus from './components/LandStatus'

const { Title } = Typography

const Land = () => {
	const [landData, setLandData] = useState(null)
	const [logs, setLogs] = useState(null)
	const [status, setStatus] = useState()
	const { landId } = useParams()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()
	const landApi = useAPI()
	const [pageTitle, setPageTitle] = useState('')
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const fetchLand = async () => {
		try {
			const response = await landApi.get(`lands/${landId}`)
			if (response?.land) {
				setLandData(response.land)
				setPageTitle(response.land.title)
				setLogs(response.land.logs || [])
				setStatus(response.land.status)
			}
		} catch (error) {
			openNotification('error', 'خطا در دریافت اطلاعات زمین')
			console.error('خطا در دریافت اطلاعات زمین:', error)
		}
	}
	useEffect(() => {
		if (landId) {
			fetchLand()
		}
	}, [landId])

	if (landApi.isLoading || !landData) return <Loading />

	return (
		<>
			<MetaTitle>{pageTitle ? `زمین ${pageTitle}` : 'جزئیات زمین'}</MetaTitle>

			{isMobile ? (
				<LandMobile landData={landData} />
			) : (
				<Flex vertical gap={16}>
					<Breadcrumbs data={{ title: pageTitle }} />
					<Flex className={styles.header} align='center'>
						<BackButton backTo={'lands'} />
						<Title level={1} className='text-h3'>
							{pageTitle}
						</Title>
						<LandStatus landId={landId} status={status} setStatus={setStatus} landTitle={pageTitle} />
					</Flex>
					<LandInfo landData={landData} setPageTitle={setPageTitle} />
					<LandNote notesData={landData.notes} api={landApi} status={status} />
					<LandLogsCard landLogs={logs} setLogs={setLogs} well={landData.wells} landId={landId} status={status} />
					{isAdmin && <DeleteCard title={`زمین ${pageTitle}`} api={`lands/${landId}`} backTo='/lands' />}
				</Flex>
			)}
		</>
	)
}

export default Land
