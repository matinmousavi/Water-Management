import { Button, Card, Flex, Input, Popconfirm, Space, Spin, Table } from 'antd'
import { DeleteTwoTone, SearchOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import FormUsers from '../FormUsers/FormUsers'
import useAPI from '../../../../hooks/useAPI'

const TableUsers = () => {
	const userApi = useAPI()
	const [userList, setUserList] = useState([])
	const [isModalOpenFormUser, setIsModalOpenFormUser] = useState(false)

	userApi.init('users')
	// چطور این دیتا رو توی userlist دخیره کنم؟
	console.log(userApi.data.users)
	console.log('loading:', userApi.isLoading)

	const showModal = () => {
		setIsModalOpenFormUser(true)
	}
	const handleSearch = (selectedKeys, confirm) => {
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
				</div>
			</div>
		),
		filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
	})

	const columns = [
		{
			title: 'نام و نام خانوادگی',
			dataIndex: 'firstName',
			key: 'firstName',
			...getColumnSearchProps('firstName'),
			render: (_, record) => (
				<Button type='link'>
					<Link to={record._id}>
						{record?.firstName} {record?.lastName}
					</Link>
				</Button>
			),
		},
		{
			title: 'شماره همراه',
			dataIndex: 'mobile',
			key: 'mobile',
		},
		{
			title: 'ایمیل',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'عملیات',
			key: 'action',
			width: 80,
			render: (_, record) => (
				<Space size='middle'>
					{record.role !== 'admin' && (
						<Popconfirm title='آیا اطمینان دارید؟' cancelText='خیر' okText='بله' onConfirm={() => handleDelete(record._id)}>
							<a>
								<DeleteTwoTone twoToneColor='#eb2f96' />
							</a>
						</Popconfirm>
					)}
				</Space>
			),
		},
	]
	if (userApi.isLoading) {
		return (
			<div>
				<Spin />
			</div>
		)
	}
	return (
		<Card>
			<Flex justify='space-between' style={{ marginBottom: '10px' }}>
				<h2>جدول کاربران</h2>
				<Button onClick={showModal} type='primary'>
					افزودن کاربر
				</Button>
			</Flex>
			<Table scroll={{ x: 'max-content' }} columns={columns} dataSource={userApi?.data?.users} rowKey={record => record._id} />
			<FormUsers isOpen={isModalOpenFormUser} setIsOpen={setIsModalOpenFormUser} />
		</Card>
	)
}
export default TableUsers
