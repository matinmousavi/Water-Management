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
const LandsList = ({ landsData }) => {
	return (
		<div>
			<Table scroll={{ y: '80vh' }} pagination={false} columns={columns} rowKey='_id' dataSource={landsData} />
		</div>
	)
}
export default LandsList
