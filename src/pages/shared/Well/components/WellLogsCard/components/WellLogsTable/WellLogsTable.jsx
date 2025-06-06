import { Popconfirm, Space, Table } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import { Link } from 'react-router'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'

const WellLogsTable = ({ data, setData, wellId }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()

	const handleDelete = async landId => {
		try {
			const updatedLands = data?.filter(item => item._id !== landId)
			const response = await wellApi.patch(`wells/${wellId}`, { lands: updatedLands })

			if (!response?.error) {
				openNotification('success', 'زمین از چاه حذف شد')
				setData({ lands: response.well.lands })
			}
		} catch (error) {
			console.error('Error:', error)
			openNotification('error', error?.error?.message || 'خطا در حذف زمین')
		}
	}

	const columns = [
		{
			title: 'تاریخ',
			dataIndex: 'name',
			key: 'name',
			render: (_, record) => <Link to={`/lands/${record._id}`}>{record.name}</Link>,
		},
		{
			title: 'ساعت شروع',
			dataIndex: 'owner',
			key: 'owner',
			render: (_, record) => `${record.owner?.firstName} ${record.owner?.lastName}`,
		},
		{
			title: 'مدت زمان آبیاری',
			dataIndex: ['owner', 'mobile'],
			key: 'mobile',
			render: (_, record) => (record?.owner?.mobile ? record?.owner?.mobile : '--'),
		},
		{
			title: 'عنوان زمین',
			dataIndex: ['owner', 'mobile'],
			key: 'mobile',
			render: (_, record) => (record?.owner?.mobile ? record?.owner?.mobile : '--'),
		},
		{
			title: 'نام مالک',
			dataIndex: ['owner', 'mobile'],
			key: 'mobile',
			render: (_, record) => (record?.owner?.mobile ? record?.owner?.mobile : '--'),
		},
		{
			title: 'توضیحات',
			dataIndex: 'action',
			key: 'action',
			render: (_, record) => (
				<Space>
					<Popconfirm title='آیا اطمینان دارید؟' cancelText='خیر' okText='بله' onConfirm={() => handleDelete(record._id)}>
						<DeleteTwoTone twoToneColor='#ff0000' />
					</Popconfirm>
				</Space>
			),
		},
		{
			title: 'عملیات',
			dataIndex: 'action',
			key: 'action',
			render: (_, record) => (
				<Space>
					<Popconfirm title='آیا اطمینان دارید؟' cancelText='خیر' okText='بله' onConfirm={() => handleDelete(record._id)}>
						<DeleteTwoTone twoToneColor='#ff0000' />
					</Popconfirm>
				</Space>
			),
		},
	]

	return <Table dataSource={data} columns={columns} rowKey={record => record._id} pagination={false} />
}

export default WellLogsTable
