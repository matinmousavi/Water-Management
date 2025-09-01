import { useEffect, useState } from 'react'
import { Select, Card, Typography, Modal, Input, Spin, Flex, Grid } from 'antd'
import IrrigationScheduleTable from './components/IrrigationScheduleTable/IrrigationScheduleTable'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

const { Title } = Typography
const { Option } = Select

export default function IrrigationSchedule({ wellId, lands = [], landGroups = [] }) {
	const [selectedSnapshot, setSelectedSnapshot] = useState(null)
	const [snapshots, setSnapshots] = useState([])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [newSnapshotName, setNewSnapshotName] = useState('')
	const [loading, setLoading] = useState(false)
	const api = useAPI()
	const { openNotification } = useNotification()
	const { useBreakpoint } = Grid
	const screens = useBreakpoint()
	const isMobile = screens.xs
	const { isAdmin } = useUser()

	const fetchSnapshots = async () => {
		try {
			setLoading(true)
			const res = await api.get(`/wells/${wellId}/snapshots`)
			setSnapshots(res.snapshots || [])
		} catch {
			openNotification('error', 'خطا', 'خطا در دریافت اسنپ‌شات‌ها')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (wellId) fetchSnapshots()
	}, [wellId])

	// ✅ Handle select snapshot (restore)
	const handleSelectChange = async value => {
		setSelectedSnapshot(value)
		try {
			await api.post(`/wells/${wellId}/snapshots/${value}/restore`)
			openNotification('success', 'بازیابی شد', 'برنامه زمان‌بندی با موفقیت بازیابی شد')
		} catch {
			openNotification('error', 'خطا', 'خطا در بازیابی اسنپ‌شات')
		}
	}

	// ✅ Open modal
	const handleCreateNewSnapshotClick = () => {
		setNewSnapshotName('')
		setIsModalVisible(true)
	}

	// ✅ Create new snapshot
	const handleModalOk = async () => {
		if (!newSnapshotName.trim()) {
			openNotification('warning', 'نام جدول الزامی است')
			return
		}
		try {
			await api.post(`/wells/${wellId}/snapshots`, { title: newSnapshotName })
			openNotification('success', 'جدول جدید ساخته شد')
			setIsModalVisible(false)
			fetchSnapshots()
		} catch {
			openNotification('error', 'خطا', 'خطا در ساخت جدول جدید')
		}
	}

	return (
		<>
			<Card>
				<Flex
					vertical={isMobile ? true : false}
					justify='space-between'
					align={isMobile ? 'stretch' : 'center'}
					gap={12}
					style={{ marginBottom: '24px' }}
				>
					<Title level={2} className='text-card-title'>
						جدول زمان‌بندی آبیاری
					</Title>

					<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
						<Spin spinning={loading}>
							{isAdmin ? (
								<Select
									value={selectedSnapshot}
									onChange={handleSelectChange}
									style={{ width: 200 }}
									placeholder='انتخاب'
									showSearch
									optionFilterProp='children'
									popupRender={menu => (
										<>
											<div
												style={{
													padding: '8px 12px',
													cursor: 'pointer',
													borderBottom: '1px solid #f0f0f0',
													background: '#fafafa',
													position: 'sticky',
													top: 0,
													zIndex: 1,
													color: '#1677ff',
													fontWeight: 500,
												}}
												onClick={handleCreateNewSnapshotClick}
											>
												ساخت جدول زمانی جدید
											</div>
											{menu}
										</>
									)}
								>
									{snapshots.map(snapshot => (
										<Option key={snapshot._id} value={snapshot._id}>
											{snapshot.title}
										</Option>
									))}
								</Select>
							) : null}
						</Spin>
					</div>
				</Flex>

				<IrrigationScheduleTable wellId={wellId} selectedSnapshot={selectedSnapshot} lands={lands} landGroups={landGroups} />
			</Card>

			<Modal
				title='ساخت جدول زمانی جدید'
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => setIsModalVisible(false)}
				okText='ثبت'
				cancelText='انصراف'
			>
				<Flex align='center' gap={8}>
					<span style={{ width: '160px' }}>نام ورژن</span>
					<Input size='large' value={newSnapshotName} onChange={e => setNewSnapshotName(e.target.value)} />
				</Flex>
			</Modal>
		</>
	)
}
