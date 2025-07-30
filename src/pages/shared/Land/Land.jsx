import { Flex, Grid, Switch, Typography } from 'antd'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import { BellOutlined } from '@ant-design/icons'

import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import BackButton from '../../../components/BackButton/BackButton'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import LandInfo from './components/LandInfo/LandInfo'
import LandNote from './components/LandNote/LandNote'
import LandLogsCard from './components/LandLogsCard/LandLogsCard'
import LandMobile from './components/LandMobile/LandMobile'
import LandStatus from './components/LandStatus'

import { useUser } from '../../../contexts/UserContext'
import useNotificationToggle from '../../../hooks/useNotificationToggle'

const { Title } = Typography

const Land = () => {
	const { landId } = useParams()
	const { isAdmin } = useUser()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const landApi = useAPI()

	if (landId) {
		landApi.init(`lands/${landId}`)
	}

	const land = landApi.data?.land
	const { enabled, loading, toggle } = useNotificationToggle({
		landId,
		initialValue: land?.notificationsEnabled,
	})

	if (landApi.isLoading || !land) return <Loading />

	return (
		<>
			<MetaTitle>{`زمین ${land.title}`}</MetaTitle>

			{isMobile ? (
				<LandMobile landData={land} />
			) : (
				<Flex vertical gap={16}>
					<Flex className='heading-container' align='center' justify='space-between'>
						<Flex align='center'>
							<BackButton backTo={'lands'} />
							<Title level={1} className='text-h3'>
								{land.title}
							</Title>
							<LandStatus landId={landId} status={land.status} setStatus={landApi.setData} landTitle={land.title} />
						</Flex>

						{isAdmin && (
							<Flex align='center'>
								<Flex gap={5}>
									<BellOutlined style={{ color: '#00000080', fontSize: '20px' }} />
									<span className='text-label'>اطلاع رسانی</span>
								</Flex>
								<Switch checked={enabled} onChange={toggle} loading={loading} />
							</Flex>
						)}
					</Flex>

					<LandInfo landData={land} setPageTitle={title => landApi.setData(d => ({ ...d, land: { ...d.land, title } }))} />
					<LandNote notesData={land.notes} api={landApi} status={land.status} />
					<LandLogsCard
						landLogs={land.logs || []}
						setLogs={logs => landApi.setData(d => ({ ...d, land: { ...d.land, logs } }))}
						well={land.wells}
						landId={landId}
						status={land.status}
					/>

					{isAdmin && <DeleteCard title={`زمین ${land.title}`} api={`lands/${landId}`} backTo='/lands' />}
				</Flex>
			)}
		</>
	)
}

export default Land
