import { Table } from 'antd'

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
const LandsTable = ({ data }) => {
	return <Table columns={columns} dataSource={data} />
}
export default LandsTable
