import { Card, Table } from 'antd'
import { Link } from 'react-router'

const columns = [
	{
		title: 'نام زمین',
		dataIndex: 'name',
		key: 'name',
		render: (name, record) => <Link to={`/lands/${record._id}`}>{name}</Link>,
	},
	{
		title: 'مالک',
		dataIndex: 'owner',
		key: 'owner',
		render: (_, record) => `${record.owner.firstName} ${record.owner.lastName}`,
	},
	{
		title: 'مساحت',
		dataIndex: 'area',
		key: 'area',
	},
	{
		title: 'موقعیت',
		dataIndex: 'location',
		key: 'location',
	},
	{
		title: 'K-Factor',
		dataIndex: 'kFactor',
		key: 'kFactor',
	},
	{
		title: 'نوع آبیاری',
		dataIndex: 'irrigationType',
		key: 'irrigationType',
	},
]
const LandsTable = ({ landsData }) => {
	return <Table columns={columns} rowKey='_id' dataSource={landsData} pagination={{ position: ['bottomCenter'], total: landsData.length, pageSize: 6 }} />
}
export default LandsTable
