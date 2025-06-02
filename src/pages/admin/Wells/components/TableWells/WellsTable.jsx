import { Button, Input, Table } from 'antd'
import { Link } from 'react-router'
import { SearchOutlined } from '@ant-design/icons'

const handleSearch = confirm => {
	confirm()
}

const getColumnSearchProps = dataIndex => ({
	filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
		<div style={{ padding: 8 }}>
			<Input
				placeholder={`جستجوی ${dataIndex}`}
				value={selectedKeys[0]}
				onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
				onPressEnter={() => handleSearch(selectedKeys, confirm)}
				style={{ marginBottom: 8, display: 'block' }}
			/>
			<div style={{ display: 'flex', gap: 8 }}>
				<Button type='primary' onClick={() => handleSearch(selectedKeys, confirm)} icon={<SearchOutlined />} size='small' style={{ width: 90 }}>
					جستجو
				</Button>
			</div>
		</div>
	),
	filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
	onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
})

const columns = [
	{
		title: 'کد پروانه',
		dataIndex: 'licenseCode',
		key: 'licenseCode',
		...getColumnSearchProps('licenseCode'),
		render: (_, record) => (
			<Button type='link'>
				<Link to={record._id}>{record?.licenseCode}</Link>
			</Button>
		),
	},
	{
		title: 'عنوان ',
		dataIndex: 'title',
		key: 'title',
	},
	{
		title: 'تعداد روزهای چرخه',
		dataIndex: 'cycleDays',
		key: 'cycleDays',
	},
]


const WellsTable = ({ data }) => {
	return (
		<Table pagination={{ position: ['bottomCenter'], total: data.length, pageSize: 6 }} columns={columns} dataSource={data} rowKey={record => record._id} />
	)
}

export default WellsTable
