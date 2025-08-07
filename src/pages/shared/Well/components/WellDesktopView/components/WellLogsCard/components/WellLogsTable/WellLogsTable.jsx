import { Modal, Space, Table } from 'antd'
import styles from './WellLogsTable.module.css'
import { DeleteTwoTone, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import useNotification from '../../../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../../../hooks/useAPI'
import useModal from '../../../../../../../../../hooks/useModal'
import moment from 'moment-jalaali'
import { useRef, useState, useMemo } from 'react'
import EditIrrigationLog from '../../../../../../../../../components/EditIrrigationLog/EditIrrigationLog'
import { useUser } from '../../../../../../../../../contexts/UserContext'

const WellLogsTable = ({ data, setLogs, wellStatus }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { open, close, isOpen, handleAfterChange } = useModal()
	const { isAdmin } = useUser()

	const deleteIdRef = useRef(null)
	const [editableGroup, setEditableGroup] = useState(null)
	const [viewableLog, setViewableLog] = useState(null)
	const [isViewModalOpen, setIsViewModalOpen] = useState(false)

	const groupedData = useMemo(() => {
		const rows = []
		const grouped = {}

		data.forEach(log => {
			const key = log.landGroup ? `${log.landGroup}_${moment(log.startedAt).format('YYYYMMDDHHmmss')}` : log._id

			if (!grouped[key]) {
				grouped[key] = {
					...log,
					logs: [],
					landGroupTitle: log.landGroupTitle || '--',
				}
			}
			grouped[key].logs.push(log)
		})

		Object.values(grouped).forEach(group => {
			const sharedDate = group.startedAt
			const sharedStartedAt = group.startedAt
			const sharedDuration = group.duration
			const sharedNote = group.note

			group.logs.forEach((log, index) => {
				rows.push({
					...log,
					groupKey: group.landGroup ? `${group.landGroup}_${moment(group.startedAt).format('YYYYMMDDHHmmss')}` : log._id,
					logs: group.logs,
					isFirstRow: index === 0,
					groupSize: group.logs.length,
					landGroupTitle: group.landGroupTitle,
					sharedDate,
					sharedStartedAt,
					sharedDuration,
					sharedNote,
				})
			})
		})

		return rows
	}, [data])

	const handleDelete = async group => {
		try {
			const ids = group.logs.map(log => log._id)
			for (const id of ids) {
				await wellApi.delete(`irrigations/${id}`)
			}
			openNotification('success', 'لاگ‌های گروهی با موفقیت حذف شدند')
			setLogs(prev => prev.filter(item => !ids.includes(item._id)))
		} catch (error) {
			openNotification('error', error?.error?.message || 'خطا در حذف لاگ‌ها')
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
			render: (_, record) => {
				if (!record.isFirstRow) return { props: { rowSpan: 0 } }
				return {
					children: record.sharedDate ? moment(record.sharedDate).locale('fa').format('dddd jD jMMMM jYYYY') : '--',
					props: {
						rowSpan: record.groupSize,
					},
				}
			},
		},
		{
			title: 'نام گروه',
			render: (_, record) => {
				if (!record.isFirstRow) return { props: { rowSpan: 0 } }
				return {
					children: record.landGroupTitle || '--',
					props: {
						rowSpan: record.groupSize,
						style: { fontWeight: 'bold' },
					},
				}
			},
		},
		{
			title: 'ساعت شروع',
			render: (_, record) => {
				if (!record.isFirstRow) return { props: { rowSpan: 0 } }
				return {
					children: record.sharedStartedAt ? moment(record.sharedStartedAt).locale('fa').format('HH:mm') : '--',
					props: {
						rowSpan: record.groupSize,
					},
				}
			},
		},
		{
			title: 'مدت زمان آبیاری',
			key: 'duration',
			render: (_, record) => {
				if (!record.isFirstRow) return { props: { rowSpan: 0 } }

				const display = record.isOngoing ? 'در حال آبیاری' : record.sharedDuration || '--'

				return {
					children: display,
					props: {
						rowSpan: record.groupSize,
					},
				}
			},
		},
		{
			title: 'عنوان زمین',
			render: (_, record) => <Link to={`/lands/${record.land?._id}`}>{record.land?.title}</Link>,
		},
		{
			title: 'مالک زمین',
			render: (_, record) => (record.land?.owner ? <Link to={`/users/${record.land.owner._id}`}>{record.land.owner.fullName}</Link> : '--'),
		},
		{
			title: 'توضیحات',
			key: 'note',
			render: (_, record) => {
				if (!record.isFirstRow) return { props: { rowSpan: 0 } }

				return {
					children: record.sharedNote ? <EyeOutlined className='eye-icon' onClick={() => handleViewNote(record)} /> : '--',
					props: {
						rowSpan: record.groupSize,
					},
				}
			},
		},
	]

	if (isAdmin || wellStatus === 'active') {
		columns.push({
			title: 'عملیات',
			key: 'action',
			render: (_, record) => {
				if (!record.isFirstRow) return { props: { rowSpan: 0 } }

				return {
					children: (
						<Space size={8}>
							<EditOutlined className='edit-icon' onClick={() => setEditableGroup(record)} />
							<DeleteTwoTone
								twoToneColor='#ff0000'
								onClick={() => {
									deleteIdRef.current = record
									open()
								}}
							/>
						</Space>
					),
					props: {
						rowSpan: record.groupSize,
					},
				}
			},
		})
	}

	return (
		<>
			<Table size='middle' dataSource={groupedData} columns={columns} rowKey={record => record.groupKey || record._id} pagination={false} bordered />

			<Modal
				title='حذف لاگ‌های گروهی'
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
				<p>آیا از حذف این گروه لاگ‌های توزیع آب اطمینان دارید؟</p>
			</Modal>

			{editableGroup && <EditIrrigationLog data={editableGroup} setLogs={setLogs} onClose={() => setEditableGroup(null)} page='well' />}

			{viewableLog && (
				<Modal
					title={`توضیحات لاگ ${viewableLog?.startedAt ? moment(viewableLog.startedAt).locale('fa').format('dddd jD jMMMM jYYYY') : ''}`}
					open={isViewModalOpen}
					onCancel={() => {
						setIsViewModalOpen(false)
						setViewableLog(null)
					}}
					footer={
						<div
							className='footer-edit-log-modal'
							onClick={() => {
								setEditableGroup(viewableLog)
								setIsViewModalOpen(false)
							}}
						>
							<EditOutlined />
							<span>ویرایش</span>
						</div>
					}
				>
					<p className={styles.note}>{viewableLog?.note}</p>
				</Modal>
			)}
		</>
	)
}

export default WellLogsTable
