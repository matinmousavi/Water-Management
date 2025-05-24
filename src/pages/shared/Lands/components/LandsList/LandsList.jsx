import { Card, Table } from 'antd'

const columns = [
	{
		title: 'نام زمین',
		dataIndex: 'name',
		key: 'name',
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
		title: 'ضریب K',
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
		<Card>
			<Table scroll={{ y: '80vh' }} pagination={false} columns={columns} rowKey='_id' dataSource={landsData} />
		</Card>
	)
}
export default LandsList
