import { Flex, Grid, Switch, Typography } from 'antd'

import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import LandInfo from './components/LandInfo/LandInfo'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import BackButton from '../../../components/BackButton/BackButton'

import LandLogsCard from './components/LandLogsCard/LandLogsCard'
import { useUser } from '../../../contexts/UserContext'
import LandMobile from './components/LandMobile/LandMobile'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useNotification from '../../../hooks/useNotification'
import useNotificationToggle from '../../../hooks/useNotificationToggle'
import LandStatus from './components/LandStatus'
import { BellOutlined } from '@ant-design/icons'
import Notes from '../../../components/Notes/Notes'
const { Title } = Typography

const Land = () => {
	const [landData, setLandData] = useState(null)
	const [logs, setLogs] = useState(null)
	const [status, setStatus] = useState()
	const { landId } = useParams()
	const { openNotification } = useNotification()
	const { isAdmin, isIrrigator } = useUser()
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

	const { enabled, loading, toggle } = useNotificationToggle({
		landId,
		initialValue: landData?.notificationsEnabled,
	})

	if (landApi.isLoading || !landData) return <Loading />

	return (
		<>
			<MetaTitle>{pageTitle ? `زمین ${pageTitle}` : 'جزئیات زمین'}</MetaTitle>

			{isMobile ? (
				<LandMobile landData={landData} />
			) : (
				<Flex vertical gap={16}>
					<Flex className='heading-container' align='center' justify='space-between'>
						<Flex align='center' gap={isMobile && 8}>
							<BackButton backTo={'lands'} />
							<Title level={1} className='text-h3'>
								{pageTitle}
							</Title>
							<LandStatus landId={landId} status={status} setStatus={setStatus} landTitle={pageTitle} />
						</Flex>
						{isAdmin ? (
							<Flex align='center' gap={isMobile && 8}>
								<Flex gap={5}>
									<BellOutlined style={{ color: '#00000080', fontSize: '20px' }} />
									<span className='text-label'>اطلاع رسانی</span>
								</Flex>
								<Switch checked={enabled} onChange={toggle} loading={loading} />
							</Flex>
						) : null}
					</Flex>
					<LandInfo landData={landData} setPageTitle={setPageTitle} />
					<Notes entityType='land' entityReference={landId} notesData={landData?.notes} status={status} />
					<LandLogsCard landLogs={logs} setLogs={setLogs} well={landData.wells} landId={landId} status={status} />
					{isAdmin && <DeleteCard title={`زمین ${pageTitle}`} api={`lands/${landId}`} backTo='/lands' />}
				</Flex>
			)}
		</>
	)
}

export default Land
