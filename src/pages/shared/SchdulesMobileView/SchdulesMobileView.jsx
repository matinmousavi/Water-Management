import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Typography, Flex, Card, Spin } from 'antd'

import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import IrrigationScheduleTable from '../Well/components/WellDesktopView/components/WellIrrigationSchedule/components/IrrigationScheduleTable/IrrigationScheduleTable'

const SchdulesMobileView = () => {
	const { wellId } = useParams()
	const api = useAPI()
	const { openNotification } = useNotification()

	const [lands, setLands] = useState([])
	const [landGroups, setLandGroups] = useState([])
	const [loading, setLoading] = useState(false)

	const fetchInitialData = async () => {
		try {
			setLoading(true)
			const [landsRes, groupsRes, schedulesRes] = await Promise.all([api.get(`/lands?wellId=${wellId}`), api.get(`/wells/${wellId}/schedules`)])

			setLands(landsRes?.lands || [])
			setLandGroups(groupsRes?.groups || [])
		} catch {
			openNotification('error', 'خطا', 'خطا در دریافت داده‌ها')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (wellId) fetchInitialData()
	}, [wellId])

	return (
		<>
			<Flex gap={8} justify='center' align='center'>
				<img src='/assets/icons/Vector.svg' alt='icon' />
				<Typography.Title level={2} className='text-h2'>
					زمان‌بندی
				</Typography.Title>
			</Flex>

			<Card style={{ marginTop: 16 }}>
				<Spin spinning={loading}>
					<IrrigationScheduleTable wellId={wellId} selectedSnapshot={null} lands={lands} landGroups={landGroups} editable={false} />
				</Spin>
			</Card>
		</>
	)
}

export default SchdulesMobileView
