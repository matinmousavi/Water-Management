import { useEffect, useState } from 'react'
import { Grid, Flex } from 'antd'
import { useParams } from 'react-router'
import useAPI from '../../../hooks/useAPI'
import { useUser } from '../../../contexts/UserContext'
import Loading from '../../../components/Loading/Loading'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import { WellProvider } from './contexts/WellContext'
import WellMobileView from './components/WellMobileView/WellMobileView'
import WellDesktopView from './components/WellDesktopView/WellDesktopView'

const Well = () => {
	const { wellId } = useParams()
	const api = useAPI()
	const { user, isAdmin, isIrrigator } = useUser()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs && !screens.md

	const [title, setTitle] = useState('')
	const [logs, setLogs] = useState([])
	const [status, setStatus] = useState('')
	const [landsData, setLandsData] = useState({ lands: [], landGroups: [] })
	const [irrigatorWells, setIrrigatorWells] = useState()
	const [cycleDays, setCycleDays] = useState(0)
	const [cycleStartDate, setCycleStartDate] = useState()

	wellId
		? api.init(`wells/${wellId}`)
		: api.init('wells', {
				filters: { irrigator: user._id },
		  })

	useEffect(() => {
		const fetchedWell = api.data?.well || api.data?.wells?.[0]
		if (fetchedWell) {
			setTitle(fetchedWell.title)
			setLogs(fetchedWell.logs || [])
			setStatus(fetchedWell.status)
			setIrrigatorWells(fetchedWell)
			setLandsData({
				lands: fetchedWell.lands || [],
				landGroups: fetchedWell.landGroups || [],
			})
			setCycleDays(fetchedWell.cycleDays || 0)
			setCycleStartDate(fetchedWell.cycleStartDate)
		}
	}, [api.data])

	const wellsApi = useAPI()
	wellsApi.init('wells')
	const filterWells = wellsApi.data?.wells?.filter(well => well?.irrigator?._id === user._id)

	if (api.isLoading || (!api.data?.well && !api.data?.wells)) {
		return <Loading />
	}

	const well = api.data?.well || api.data?.wells?.[0]
	const actualWellId = wellId || well?._id

	const contextValue = {
		cycleDays,
		setCycleDays,
		cycleStartDate,
		setCycleStartDate,
	}

	return (
		<WellProvider value={contextValue}>
			<MetaTitle>{title ? `چاه ${title}` : 'جزئیات چاه'}</MetaTitle>
			<Flex vertical gap={20}>
				{isMobile && isIrrigator && (
					<WellMobileView wellId={well?._id} setIrrigatorWells={setIrrigatorWells} irrigatorWells={irrigatorWells} filterWells={filterWells} />
				)}
				{(isAdmin || (isIrrigator && !isMobile)) && (
					<WellDesktopView
						title={title}
						well={well}
						setTitle={setTitle}
						status={status}
						setStatus={setStatus}
						landsData={landsData}
						setLandsData={setLandsData}
						logs={logs}
						setLogs={setLogs}
						actualWellId={actualWellId}
					/>
				)}

				{isAdmin && <DeleteCard title={`چاه ${title}`} api={`wells/${actualWellId}`} backTo='/wells' />}
			</Flex>
		</WellProvider>
	)
}

export default Well
