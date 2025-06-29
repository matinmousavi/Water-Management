import { Flex, Grid, Tag, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'

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

const { Title } = Typography

const Land = () => {
	const [landData, setLandData] = useState(null)
	const [logs, setLogs] = useState(null)
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

			{isMobile ? (
				<LandMobile landData={landData} />
			) : (
				<Flex vertical gap={16}>
					<Breadcrumbs data={{ title: pageTitle }} />
					<Flex className={styles.header} align='center'>
						<BackButton backTo={'wells'} />
						<Title level={1} className='text-h3'>
							{pageTitle}
						</Title>
						<Tag color='green'>
							<Flex align='center' gap={3}>
								فعال <EditOutlined />
							</Flex>
						</Tag>
					</Flex>
					<LandNote notesData={landData.notes} api={landApi} mainData={landData} setMainData={setLandData} />
					<LandInfo landData={landData} setPageTitle={setPageTitle} />
					<LandLogsCard landLogs={logs} setLogs={setLogs} />
					{isAdmin && <DeleteCard title='زمین' api={`lands/${landId}`} backTo='/lands' />}
				</Flex>
			)}
		</>
	)
}

export default Land
