import { useRef, useState } from 'react'
import { Modal, Space, Table } from 'antd'
import { DeleteTwoTone, EditOutlined, EyeOutlined } from '@ant-design/icons'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import useModal from '../../../../../../../hooks/useModal'
import moment from 'moment-jalaali'
import EditIrrigationLog from '../../../../../../../components/irrigation/EditIrrigationLog/EditIrrigationLog'
import { useUser } from '../../../../../../../contexts/UserContext'

const LandLogsTable = ({ data, setLogs, status }) => {
	const wellApi = useAPI()
	const deleteIdRef = useRef(null)
	const { openNotification } = useNotification()
	const [selectedLog, setSelectedLog] = useState(null)
	const [viewableLog, setViewableLog] = useState(null)
	const [isViewModalOpen, setIsViewModalOpen] = useState(false)
	const [editableLog, setEditableLog] = useState(null)
	const { open, close, isOpen, handleAfterChange } = useModal()
	const { isAdmin } = useUser()

	const handleDelete = async irrigationsId => {
		try {
			const response = await wellApi.delete(`irrigations/${irrigationsId}`)
			if (!response?.error) {
				openNotification('success', 'لاگ آبیاری با موفقیت حذف شد')
				setLogs(prev => prev.filter(item => item._id !== irrigationsId))
				close()
			}
		} catch (error) {
			openNotification('error', error?.error?.message || 'خطا در حذف لاگ آبیاری')
		}
	}

	const handleEditClick = record => {
		setSelectedLog(record)
		open()
	}
	const handleCancel = () => {
		deleteIdRef.current = null
		close()
	}
	const handleViewNote = log => {
		setViewableLog(log)
		setIsViewModalOpen(true)
	}

	const columns = [
		{
			title: 'تاریخ ',
			width: 150,
			render: record => (record?.startedAt ? moment(record.startedAt).locale('fa').format('dddd jD jMMMM jYYYY') : '--'),
		},
		{
			title: 'ساعت شروع',
			width: 120,
			render: record => (record?.startedAt ? moment(record.startedAt).locale('fa').format('HH:mm') : '--'),
		},
		{
			title: 'مدت زمان آبیاری',
			key: 'duration',
			width: 150,
			render: (_, record) => (!record.endedAt ? 'در حال آبیاری' : `${record.duration}`),
		},
		{
			title: 'توضیحات',
			dataIndex: ['note'],
			key: 'note',
			width: 100,
			render: (_, record) => (record?.note ? <EyeOutlined className='eye-icon' onClick={() => handleViewNote(record)} /> : '--'),
		},
	]

	if (isAdmin || status === 'active') {
		columns.push({
			title: 'عملیات',
			key: 'action',
			width: 150,
			render: (_, record) => (
				<Space size={8}>
					<EditOutlined className='edit-icon' onClick={() => handleEditClick(record)} />
					<DeleteTwoTone
						twoToneColor='#ff0000'
						onClick={() => {
							deleteIdRef.current = record._id
							open()
						}}
					/>
				</Space>
			),
		})
	}

	const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

	return (
		<>
			<Table size='middle' dataSource={data} columns={columns} rowKey={record => record._id} pagination={false} bordered scroll={{ x: totalWidth }} />
			{editableLog && <EditIrrigationLog data={editableLog} setLogs={setLogs} onClose={() => setEditableLog(null)} page='well' />}

			<Modal
				title='حذف لاگ توزیع آب'
				open={isOpen}
				onOk={() => handleDelete(deleteIdRef.current)}
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

			{selectedLog && (
				<EditIrrigationLog
					data={selectedLog}
					setLogs={setLogs}
					onClose={() => {
						setSelectedLog(null)
						close()
					}}
					page='land'
				/>
			)}
			{viewableLog && (
				<Modal
					title={`توضیحات لاگ توزیع آب ${viewableLog?.startedAt ? moment(viewableLog.startedAt).locale('fa').format('dddd jD jMMMM jYYYY') : ''}`}
					open={isViewModalOpen}
					onCancel={() => {
						setIsViewModalOpen(false)
						setViewableLog(null)
					}}
					footer={
						<div
							className='footer-edit-log-modal'
							onClick={() => {
								setEditableLog(viewableLog)
								setIsViewModalOpen(false)
							}}
						>
							<EditOutlined />
							<span>ویرایش</span>
						</div>
					}
				>
					<p style={{ lineHeight: '2' }}>{viewableLog?.note}</p>
				</Modal>
			)}
		</>
	)
}

export default LandLogsTable
