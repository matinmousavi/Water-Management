import { Button, Input, Table } from 'antd'
import { Link } from 'react-router'
import { SearchOutlined, CloseOutlined } from '@ant-design/icons'

const handleSearch = (confirm) => {
	confirm()
}

const handleReset = (clearFilters, confirm) => {
	clearFilters()
	confirm()
}

const getColumnSearchProps = dataIndex => ({
	filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
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
				<Button onClick={() => handleReset(clearFilters, confirm)} size='small' style={{ width: 90 }} icon={<CloseOutlined />}>
					حذف فیلتر
				</Button>
			</div>
		</div>
	),
	filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
	onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
})

const roleLabels = {
	admin: 'مدیر',
	irrigator: 'آبیار',
	landOwner: 'مالک زمین',
}

const columns = [
	{
		title: 'نام و نام خانوادگی',
		dataIndex: 'firstName',
		key: 'firstName',
		render: (_, record) => (
			<Button type='link'>
				<Link to={record._id}>
					{record?.firstName} {record?.lastName}
				</Link>
			</Button>
		),
	},
	{
		title: 'نقش',
		dataIndex: 'role',
		key: 'role',
		render: role => roleLabels[role] || role,
	},
	{
		title: 'شماره تماس',
		dataIndex: 'mobile',
		key: 'mobile',
			
	},
	{
		title: 'آدرس ایمیل',
		dataIndex: 'email',
		key: 'email',
	},
	{
		title: 'کد حسابداری',
		dataIndex: 'accountingCode',
		key: 'accountingCode',
	},
]

const UsersTable = ({ usersData }) => {
	return <Table pagination={{ position: ['bottomCenter'], total: usersData.length, pageSize: 6 }} columns={columns} dataSource={usersData} rowKey={record => record._id} />
}

export default UsersTable
