import { useState } from 'react'
import { Button, Modal, Popconfirm, Space, Table } from 'antd'
import { DeleteTwoTone, EditOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import useModal from '../../../../../../../hooks/useModal'
import WellEditLog from '../WellEditLog/WellEditLog'

const WellLogsTable = ({ data, setLogs }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { open, close, isOpen, handleAfterChange } = useModal()

	const [selectedLog, setSelectedLog] = useState(null)
	const [selectedLogId, setSelectedLogId] = useState(null) // برای حذف

	const handleDelete = async () => {
		if (!selectedLogId) return
		try {
			const response = await wellApi.delete(`irrigations/${selectedLogId}`)
			if (!response?.error) {
				openNotification('success', 'لاگ آبیاری با موفقیت حذف شد')
				setLogs(prev => prev.filter(item => item._id !== selectedLogId))
			}
		} catch (error) {
			openNotification('error', error?.error?.message || 'خطا در حذف لاگ آبیاری')
		} finally {
			setSelectedLogId(null)
			close()
		}
	}

	const handleCancel = () => {
		setSelectedLogId(null)
		close()
	}

	const handleEditClick = record => {
		setSelectedLog(record)
		open()
	}

	const columns = [
		{
			title: 'تاریخ ',
			render: record => new Date(record.startedAt).toLocaleDateString('fa-IR'),
		},
		{
			title: 'ساعت شروع',
			render: record => (record.startedAt ? new Date(record.startedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '--'),
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
			dataIndex: ['land', 'title'],
			key: 'landTitle',
			render: (text, record) => <Link to={`/lands/${record.land?._id}`}>{text}</Link> || '--',
		},
		{
			title: 'نام مالک',
			dataIndex: ['land', 'owner'],
			key: 'landOwner',
			render: owener => (owener ? `${owener.firstName} ${owener.lastName}` : '--'),
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
					<DeleteTwoTone
						twoToneColor='#ff0000'
						onClick={() => {
							setSelectedLogId(record._id)
							open()
						}}
					/>
					<Button type='link' icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
				</Space>
			),
		},
	]

	return (
		<>
			<Table dataSource={data} columns={columns} rowKey={record => record._id} pagination={false} bordered />
			{selectedLog && isOpen && !selectedLogId && (
				<WellEditLog
					logData={selectedLog}
					setLogs={setLogs}
					onClose={() => {
						close()
						setSelectedLog(null)
					}}
				/>
			)}
			{selectedLogId && (
				<Modal
					title='حذف لاگ توزیع آب'
					open={isOpen}
					onOk={handleDelete}
					onCancel={handleCancel}
					afterOpenChange={handleAfterChange}
					okText='تایید'
					cancelText='انصراف'
					okButtonProps={{
						danger: true,
						type: 'primary',
					}}
					confirmLoading={wellApi.isLoading}
				>
					<p>آیا از حذف این لاگ توزیع آب اطمینان دارید؟</p>
				</Modal>
			)}
		</>
	)
}

export default WellLogsTable
