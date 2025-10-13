import { useState, useEffect } from 'react'
import { Card, Spin } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import IrrigationScheduleTable from '../../shared/Well/components/WellDesktopView/components/WellIrrigationSchedule/components/IrrigationScheduleTable/IrrigationScheduleTable'
import HeaderIrrigation from '../../../components/irrigation/HeaderIrrigation/HeaderIrrigation'
import { useUser } from '../../../contexts/UserContext'

const SchedulesMobile = () => {
	const api = useAPI()
	const { user } = useUser()
	const { openNotification } = useNotification()
	const wellsApi = useAPI()

	const [lands, setLands] = useState([])
	const [landGroups, setLandGroups] = useState([])
	const [loading, setLoading] = useState(false)

	const [selectedWellId, setSelectedWellId] = useState(null)
	const [selectedWell, setSelectedWell] = useState(null)

	wellsApi.init('wells', { filters: { irrigator: user._id } })
	const filterWells = wellsApi?.data?.wells

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
		if (filterWells?.length && !selectedWellId) {
			setSelectedWellId(filterWells[0]._id)
			setSelectedWell(filterWells[0])
		}
	}, [filterWells, selectedWellId])

	useEffect(() => {
		if (selectedWellId) {
			fetchInitialData(selectedWellId)
		}
	}, [selectedWellId])

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
				<Spin spinning={loading || wellsApi.isLoading}>
					{selectedWellId && (
						<IrrigationScheduleTable wellId={selectedWellId} selectedSnapshot={null} lands={lands} landGroups={landGroups} editable={false} />
					)}
				</Spin>
			</Card>
		</>
	)
}

export default SchedulesMobile
