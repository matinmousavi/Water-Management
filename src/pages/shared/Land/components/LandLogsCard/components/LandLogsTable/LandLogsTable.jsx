import { useState } from 'react'
import { Button, Popconfirm, Space, Table } from 'antd'
import { DeleteTwoTone, EditOutlined, EyeTwoTone } from '@ant-design/icons'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import useModal from '../../../../../../../hooks/useModal'
import moment from 'moment-jalaali'
import EditIrrigationLog from '../../../../../../../components/EditIrrigationLog/EditIrrigationLog'

const LandLogsTable = ({ data, setLogs }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { open, close } = useModal()
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
		</>
	)
}

export default LandLogsTable
