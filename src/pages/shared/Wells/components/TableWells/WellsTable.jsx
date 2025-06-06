import { Table } from 'antd'
import { Link } from 'react-router'

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
		render: irrigator =>
			irrigator?._id ? (
				<Link to={`/users/${irrigator._id}`}>
					{irrigator.firstName} {irrigator.lastName}
				</Link>
			) : (
				<span>-</span>
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

const WellsTable = ({ WellsData }) => {
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
