import { Flex, Grid, Switch, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/common/Loading/Loading'
import LandInfo from './components/LandInfo/LandInfo'
import MetaTitle from '../../../components/common/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/common/DeleteCard/DeleteCard'
import BackButton from '../../../components/common/BackButton/BackButton'
import LandLogsCard from './components/LandLogsCard/LandLogsCard'
import { useUser } from '../../../contexts/UserContext'
import LandMobile from './components/LandMobile/LandMobile'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useNotification from '../../../hooks/useNotification'
import useNotificationToggle from '../../../hooks/useNotificationToggle'
import LandStatus from './components/LandStatus'
import { BellOutlined } from '@ant-design/icons'
import Notes from '../../../components/common/Notes/Notes'

const { Title } = Typography

const Land = () => {
	const [landData, setLandData] = useState(null)
	const [allWells, setAllWells] = useState([])
	const [logs, setLogs] = useState(null)
	const [status, setStatus] = useState()
	const { landId } = useParams()
	const { openNotification } = useNotification()
	const { isAdmin, isIrrigator } = useUser()
	const landApi = useAPI()
	const wellsApi = useAPI()
	const [pageTitle, setPageTitle] = useState('')
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs && !screens.md

	const fetchInitialData = async () => {
		try {
			const [landRes, wellsRes] = await Promise.all([landApi.get(`lands/${landId}`), wellsApi.get('wells')])

			if (landRes?.land) {
				setLandData(landRes.land)
				setPageTitle(landRes.land.title)
				setLogs(landRes.land.logs || [])
				setStatus(landRes.land.status)
			}
			if (wellsRes?.wells) {
				setAllWells(wellsRes.wells)
			}
		} catch (error) {
			openNotification('error', 'خطا در دریافت اطلاعات صفحه')
			console.log('خطا: ', error)
		}
	}

	useEffect(() => {
		if (landId) {
			fetchInitialData()
		}
	}, [landId])

	const { enabled, loading, toggle } = useNotificationToggle({
		landId,
		initialValue: landData?.notificationsEnabled,
	})

	if (landApi.isLoading || wellsApi.isLoading || !landData) return <Loading />

	return (
		<>
			<MetaTitle>{pageTitle ? `زمین ${pageTitle}` : 'جزئیات زمین'}</MetaTitle>
			{isMobile && isIrrigator && <LandMobile landData={landData} landId={landId} />}
			{((isIrrigator && !isMobile) || isAdmin) && (
				<Flex vertical gap={16}>
					<Flex className='heading-container' align='center' justify='space-between'>
						<Flex align='center' gap={isMobile ? 8 : 16}>
							<BackButton backTo='/lands' />
							<Title level={1} className='text-h3'>
								{pageTitle}
							</Title>
							<LandStatus landId={landId} status={status} setStatus={setStatus} landTitle={pageTitle} />
						</Flex>
						{isAdmin && (
							<Flex align='center' gap={isMobile ? 8 : 16}>
								<Flex gap={5}>
									<BellOutlined style={{ color: '#00000080', fontSize: '20px' }} />
									<span className='text-label'>اطلاع رسانی</span>
								</Flex>
								<Switch checked={enabled} onChange={toggle} loading={loading} />
							</Flex>
						)}
					</Flex>
					<LandInfo landData={landData} setPageTitle={setPageTitle} />
					<Notes entityType='land' entityReference={landId} notesData={landData?.notes} status={status} />
					<LandLogsCard landLogs={logs} setLogs={setLogs} defaultWell={landData.wells?.[0]} allWells={allWells} landId={landId} status={status} />
					{isAdmin && <DeleteCard title={`زمین ${pageTitle}`} api={`lands/${landId}`} backTo='/lands' />}
				</Flex>
			)}
		</>
	)
}

export default Land
