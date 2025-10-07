import { Card, Flex, Table, Typography, Modal, Space } from 'antd'
import moment from 'moment-jalaali'
import { EyeOutlined } from '@ant-design/icons'
import { useState, useEffect, useRef } from 'react'
import GroupEditLogs from './components/GroupEditLogs/GroupEditLogs'

const { Title } = Typography

function uniqueGroupLogs(logs) {
	const map = new Map()
	logs.forEach(log => {
		const key = `${log.landGroupId}_${log.startedAt}`
		if (!map.has(key)) {
			map.set(key, log)
		}
	})
	return Array.from(map.values())
}

const GroupLogs = ({ logs: initialLogs, groupId, wellId }) => {
	const [logs, setLogs] = useState([])
	const [viewableLog, setViewableLog] = useState(null)
	const [isViewModalOpen, setIsViewModalOpen] = useState(false)
	const initialLoaded = useRef(false)

	useEffect(() => {
		if (!initialLoaded.current && initialLogs?.length) {
			setLogs(uniqueGroupLogs(initialLogs))
			initialLoaded.current = true
		}
	}, [initialLogs])

	const handleLogAdded = newLog => {
		setLogs(prevLogs => uniqueGroupLogs([newLog, ...prevLogs]))
	}

	const columns = [
		{
			title: 'تاریخ',
			render: record => (record?.startedAt ? moment(record.startedAt).locale('fa').format('dddd jD jMMMM jYYYY') : '--'),
		},
		{
			title: 'ساعت شروع',
			render: record => (record?.startedAt ? moment(record.startedAt).locale('fa').format('HH:mm') : '--'),
		},
		{
			title: 'مدت زمان آبیاری',
			key: 'duration',
			render: (_, record) => {
				if (record.isOngoing) return 'در حال آبیاری'
				if (!record.duration) return '--'
				return record.duration
			},
		},
		{
			title: 'توضیحات',
			key: 'note',
			render: (_, record) =>
				record?.note ? (
					<EyeOutlined
						className='eye-icon'
						onClick={() => {
							setViewableLog(record)
							setIsViewModalOpen(true)
						}}
					/>
				) : (
					'--'
				),
		},
		{
			title: 'عملیات',
			key: 'action',
			render: (_, record) => (
				<Space size={8}>
					<GroupEditLogs
						mode='edit'
						log={record}
						onLogUpdated={updated => {
							setLogs(prev => prev.map(l => (l._id === updated._id ? updated : l)))
						}}
					/>
				</Space>
			),
		},
	]

	return (
		<Card>
			<Flex gap={36} vertical>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-card-title'>
						لاگ توزیع آب ({logs?.length || 0})
					</Title>
					<GroupEditLogs mode='add' groupId={groupId} wellId={wellId} onLogAdded={handleLogAdded} />
				</Flex>

				<Table bordered dataSource={logs} columns={columns} rowKey={record => `${record.landGroupId}_${record.startedAt}`} />

				{viewableLog && (
					<Modal
						title={`توضیحات لاگ توزیع آب ${viewableLog?.startedAt ? moment(viewableLog.startedAt).locale('fa').format('dddd jD jMMMM jYYYY') : ''}`}
						open={isViewModalOpen}
						onCancel={() => {
							setIsViewModalOpen(false)
							setViewableLog(null)
						}}
						footer={false}
					>
						<p style={{ lineHeight: '2' }}>{viewableLog?.note}</p>
					</Modal>
				)}
			</Flex>
		</Card>
	)
}

export default GroupLogs
