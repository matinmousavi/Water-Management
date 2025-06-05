import { Table } from 'antd'
import { Link } from 'react-router'
import { useUser } from '../../../../../contexts/UserContext'

const WellsTable = ({ WellsData }) => {
	const { isIrrigator } = useUser()
	
	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: 'title',
			key: 'title',
			render: (text, record) => <Link to={`/wells/${record._id}`}>{text}</Link>,
		},
		{
			title: 'میرآب',
			dataIndex: 'irrigator',
			key: 'irrigator',
			render: (irrigator , record) => (
				irrigator._id ? (
					<Link to={isIrrigator ? `/wells/${record._id}` : `/users/${irrigator._id}`}>
						{irrigator.firstName} {irrigator.lastName}
					</Link>
				) : (
					<span>-</span>
				)
			),
		},
		{
			title: 'تعداد زمین',
			dataIndex: 'lands',
			key: 'lands',
			render: lands => (Array.isArray(lands) ? lands.length : 0),
		},
		{
			title: 'کد پروانه',
			dataIndex: 'licenseCode',
			key: 'licenseCode',
		},
		{
			title: 'چرخه',
			dataIndex: 'cycleDays',
			key: 'cycleDays',
		},
	]

	return (
		<Table
			pagination={{ position: ['bottomCenter'], total: WellsData.length, pageSize: 6 }}
			columns={columns}
			dataSource={WellsData}
			rowKey={record => record._id}
			bordered
			size='small'
		/>
	)
}

export default WellsTable
