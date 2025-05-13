import { Button, Card, Input, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const TableUsers = () => {
	const dataSource = [
		{
			key: '1',
			name: 'محمد',
			address: 'باغ شوکت آباد',
			tel: '0911111111',
		},
		{
			key: '2',
			name: 'امیر',
			address: 'باغ بیدمشک',
			tel: '0911111111',
		},
	]

	const handleSearch = (selectedKeys, confirm) => {
		confirm()
	}

	const handleReset = clearFilters => {
		clearFilters()
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
					<Button onClick={() => handleReset(clearFilters)} size='small' style={{ width: 90 }}>
						حالت مجدد
					</Button>
				</div>
			</div>
		),
		filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
	})

	const columns = [
		{
			title: 'نام و نام خانوادگی',
			dataIndex: 'name',
			key: 'name',
			...getColumnSearchProps('name'),
		},
		{
			title: 'شماره همراه',
			dataIndex: 'tel',
			key: 'tel',
		},
		{
			title: 'آدرس',
			dataIndex: 'address',
			key: 'address',
		},
	]
	return (
		<Card>
			<h2>جدول کاربران</h2>
			<Table scroll={{ x: 'max-content' }} columns={columns} dataSource={dataSource} rowKey='key' />
		</Card>
	)
}
export default TableUsers
