import { useState } from 'react'
import { Button, Popconfirm, Space, Table } from 'antd'
import { DeleteTwoTone, EditOutlined, EyeTwoTone } from '@ant-design/icons'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import useModal from '../../../../../../../hooks/useModal'
import LandEditLog from '../LandEditLog/LandEditLog'

const LandLogsTable = ({ data, setLogs }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { open, close, isOpen } = useModal()
	const [selectedLog, setSelectedLog] = useState(null)

	const handleDelete = async irrigationsId => {
		try {
			const response = await wellApi.delete(`irrigations/${irrigationsId}`)
			if (!response?.error) {
				openNotification('success', 'لاگ آبیاری با موفقیت حذف شد')
				setLogs(prev => prev.filter(item => item._id !== irrigationsId))
			}
		} catch (error) {
			openNotification('error', error?.error?.message || 'خطا در حذف لاگ آبیاری')
		}
	}

	const handleEditClick = record => {
		setSelectedLog(record)
		open()
	}

	const columns = [
		{
			title: 'تاریخ ',
			render: record => new Date(record.createdAt).toLocaleDateString('fa-IR'),
		},
		{
			title: 'ساعت شروع',
			render: record => (record.createdAt ? new Date(record.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '--'),
		},
		{
			title: 'مدت زمان آبیاری',
			key: 'duration',
			render: (_, record) => {
				if (!record.endTime) return 'در حال آبیاری'
				const start = new Date(record.startTime)
				const end = new Date(record.endTime)
				const totalMinutes = Math.floor((end - start) / (1000 * 60))
				const hours = Math.floor(totalMinutes / 60)
				const minutes = totalMinutes % 60
				return `${hours}:${minutes.toString().padStart(2, '0')}`
			},
		},
		{
			title: 'توضیحات',
			dataIndex: ['note'],
			key: 'note',
			render: () => <EyeTwoTone />,
		},
		{
			title: 'عملیات',
			key: 'action',
			render: (_, record) => (
				<Space>
					<Popconfirm title='آیا اطمینان دارید؟' cancelText='خیر' okText='بله' onConfirm={() => handleDelete(record._id)}>
						<DeleteTwoTone twoToneColor='#ff0000' />
					</Popconfirm>
					<Button type='link' icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
				</Space>
			),
		},
	]

	return (
		<>
			<Table dataSource={data} columns={columns} rowKey={record => record._id} pagination={false} bordered />
			{selectedLog && isOpen && (
				<LandEditLog
					logData={selectedLog}
					setLogs={setLogs}
					onClose={() => {
						close()
						setSelectedLog(null)
					}}
				/>
			)}
		</>
	)
}

export default LandLogsTable
