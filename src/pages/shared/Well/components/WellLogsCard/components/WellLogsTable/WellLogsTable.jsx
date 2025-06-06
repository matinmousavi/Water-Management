import { useState } from 'react'
import { Button, Popconfirm, Space, Table } from 'antd'
import { DeleteTwoTone, EditOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import useModal from '../../../../../../../hooks/useModal'
import WellEditLog from '../WellEditLog/WellEditLog'

const WellLogsTable = ({ data, setLogs, wellId }) => {
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
			title: 'تاریخ',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: createdAt => new Date(createdAt).toLocaleDateString('fa-IR'),
		},
		{
			title: 'ساعت شروع',
			dataIndex: 'startTime',
			key: 'startTime',
			render: startTime => (startTime ? new Date(startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '--'),
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
			title: 'عنوان زمین',
			dataIndex: ['land', 'name'],
			key: 'landName',
			render: (text, record) => <Link to={`/lands/${record.land._id}`}>{text}</Link> || '--',
		},
		{
			title: 'نام ایجاد کننده لاگ',
			dataIndex: ['createdBy'],
			key: 'createdBy',
			render: author => (author ? `${author.firstName} ${author.lastName}` : '--'),
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
			<Table dataSource={data} columns={columns} rowKey={record => record._id} pagination={false} />
			{selectedLog && isOpen && (
				<WellEditLog
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

export default WellLogsTable
