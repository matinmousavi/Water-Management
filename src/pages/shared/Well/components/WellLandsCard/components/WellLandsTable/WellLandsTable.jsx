import { Popconfirm, Space, Table } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import { Link } from 'react-router'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import { useUser } from '../../../../../../../contexts/UserContext'

const WellLandsTable = ({ data, setData, wellId }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()

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
			title: 'عنوان زمین',
			dataIndex: 'name',
			key: 'name',
			render: (_, record) => <Link to={`/lands/${record._id}`}>{record.name}</Link>,
		},
		{
			title: 'مالک زمین',
			dataIndex: 'owner',
			key: 'owner',
			render: (_, record) => `${record.owner?.firstName} ${record.owner?.lastName}`,
		},
		{
			title: 'شماره تماس',
			dataIndex: ['owner', 'mobile'],
			key: 'mobile',
			render: (_, record) => (record?.owner?.mobile ? record?.owner?.mobile : '--'),
		},
		{
			title: 'آخرین زمان آبیاری',
			dataIndex: 'lastDateIrrigation',
			key: 'lastDateIrrigation',
			render: (_, record) => record?.logs || '--',
		},
		{
			title: 'زمان آبیاری بعدی',
			dataIndex: 'nextDateIrrigation',
			key: 'nextDateIrrigation',
			render: (_, record) => record?.logs || '--',
		},
	]

	if (isAdmin) {
		columns.push({
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
		})
	}

	return <Table dataSource={data} columns={columns} rowKey={record => record._id} pagination={false} />
}

export default WellLandsTable
