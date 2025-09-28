import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, Spin } from 'antd'

import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import IrrigationScheduleTable from '../Well/components/WellDesktopView/components/WellIrrigationSchedule/components/IrrigationScheduleTable/IrrigationScheduleTable'
import HeaderIrrigation from '../../../components/HeaderIrrigation/HeaderIrrigation'
import { useUser } from '../../../contexts/UserContext'

const SchdulesMobileView = () => {
	const { wellId: routeWellId } = useParams()
	const api = useAPI()
	const { user } = useUser()
	const { openNotification } = useNotification()
	const wellsApi = useAPI()

	const [lands, setLands] = useState([])
	const [landGroups, setLandGroups] = useState([])
	const [loading, setLoading] = useState(false)

	const [selectedWellId, setSelectedWellId] = useState(routeWellId)
	const [selectedWell, setSelectedWell] = useState(null)

	wellsApi.init('wells')
	const filterWells = wellsApi.data?.wells?.filter(well => well?.irrigator?._id === user._id)

	const fetchInitialData = async wellId => {
		try {
			setLoading(true)
			const [landsRes, groupsRes] = await Promise.all([api.get(`/lands?wellId=${wellId}`), api.get(`/wells/${wellId}/schedules`)])
			setLands(landsRes?.lands || [])
			setLandGroups(groupsRes?.groups || [])
		} catch {
			openNotification('error', 'خطا', 'خطا در دریافت داده‌ها')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (selectedWellId) fetchInitialData(selectedWellId)
	}, [selectedWellId])

	useEffect(() => {
		if (filterWells?.length && selectedWellId && !selectedWell) {
			const well = filterWells.find(w => w._id === selectedWellId)
			if (well) setSelectedWell(well)
		}
	}, [filterWells, selectedWellId, selectedWell])

	return (
		<>
			<HeaderIrrigation
				selectData={filterWells}
				setSelect={well => {
					if (!well?._id) return
					setSelectedWellId(well._id)
					setSelectedWell(well)
				}}
				selectTitle={selectedWell?.title}
				isSelect
				title='زمان‌بندی'
				icon='/assets/icons/Vector.svg'
			/>

			<Card style={{ marginTop: 16 }}>
				<Spin spinning={loading}>
					<IrrigationScheduleTable wellId={selectedWellId} selectedSnapshot={null} lands={lands} landGroups={landGroups} editable={false} />
				</Spin>
			</Card>
		</>
	)
}

export default SchdulesMobileView
