import { Flex, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/LandInfo/LandInfo'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import BackButton from '../../../components/BackButton/BackButton'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import LandNote from './components/LandNote/LandNote'
import LandLogsCard from './components/LandLogsCard/LandLogsCard'
import { useUser } from '../../../contexts/UserContext'
import LandStatus from './components/LandStatus'
import useNotification from '../../../hooks/useNotification'

const { Title } = Typography

const Land = () => {
	const [landData, setLandData] = useState(null)
	const { landId } = useParams()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()
	const landApi = useAPI()
	const [pageTitle, setPageTitle] = useState('')
	const [logs, setLogs] = useState([])

	const fetchLand = async () => {
		try {
			const response = await landApi.get(`lands/${landId}`)
			if (response?.land) {
				setLandData(response.land)
				setPageTitle(response.land.title)
				setLogs(response.land.logs || [])
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
			<MetaTitle>{pageTitle || 'ویرایش زمین'}</MetaTitle>

			<Flex vertical gap={16}>
				<Breadcrumbs data={{ title: pageTitle }} />

				<Flex align='center' gap={16}>
					<BackButton backTo={'wells'} />
					<Title level={1} className='text-h3'>
						{pageTitle}
					</Title>
					<LandStatus landId={landId} currentStatus={landData.status} landTitle={pageTitle} />
				</Flex>

				<ContactInfoCard landData={landData} setPageTitle={setPageTitle} />
				<LandNote notesData={landData.notes} api={landApi} mainData={landData} setMainData={setLandData} />
				<LandLogsCard landLogs={logs} setLogs={setLogs} />

				{isAdmin && <DeleteCard title='زمین' api={`lands/${landId}`} backTo='/lands' />}
			</Flex>
		</>
	)
}

export default Land
