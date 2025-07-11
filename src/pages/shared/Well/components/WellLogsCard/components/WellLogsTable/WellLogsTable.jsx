import { Button, Modal, Space, Table } from 'antd'
import { DeleteTwoTone, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import useModal from '../../../../../../../hooks/useModal'
import moment from 'moment-jalaali'
import { useRef, useState } from 'react'
import EditIrrigationLog from '../../../../../../../components/EditIrrigationLog/EditIrrigationLog'

const WellLogsTable = ({ data, setLogs, title, wellStatus }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { open, close, isOpen, handleAfterChange } = useModal()

	const deleteIdRef = useRef(null)
	const [editableLog, setEditableLog] = useState(null)
	const [viewableLog, setViewableLog] = useState(null)
	const [isViewModalOpen, setIsViewModalOpen] = useState(false)

	const handleDelete = async id => {
		if (!id) return
		try {
			const response = await wellApi.delete(`irrigations/${id}`)
			if (!response?.error) {
				openNotification('success', 'لاگ آبیاری با موفقیت حذف شد')
				setLogs(prev => prev.filter(item => item._id !== id))
			}
		} catch (error) {
			openNotification('error', error?.error?.message || 'خطا در حذف لاگ آبیاری')
		} finally {
			deleteIdRef.current = null
			close()
		}
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
				if (!record.endedAt) return 'در حال آبیاری'
				return `${record.duration}`
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
			render: owner =>
				owner ? (
					<Link to={`/users/${owner?._id}`}>
						{owner.firstName} {owner.lastName}
					</Link>
				) : (
					<span>--</span>
				),
		},
		{
			title: 'توضیحات',
			dataIndex: 'note',
			key: 'note',
			render: (_, record) => (record?.note ? <EyeOutlined className='eye-icon' onClick={() => handleViewNote(record)} /> : '--'),
		},
	]

	if (wellStatus === 'active') {
		columns.push({
			title: 'عملیات',
			key: 'action',
			render: (_, record) => (
				<Space>
					<Button
						type='link'
						icon={<EditOutlined />}
						onClick={() => {
							setEditableLog(record)
						}}
					/>
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
	return (
		<>
			<Table dataSource={data} columns={columns} rowKey={record => record._id} pagination={false} bordered />

			<Modal
				title={`حذف لاگ توزیع آب چاه ${title}`}
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

			{editableLog && <EditIrrigationLog data={editableLog} setLogs={setLogs} onClose={() => setEditableLog(null)} page='well' />}

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
							<span>ویرایش کردن لاگ</span>
						</div>
					}
				>
					<p style={{ lineHeight: '2' }}>{viewableLog?.note}</p>
				</Modal>
			)}
		</>
	)
}

export default WellLogsTable
