import { Avatar, Button, Input, Table, Tag } from 'antd'
import { Link } from 'react-router'
import { SearchOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons'
import React from 'react'
import useContainerHeight from '../../../../../hooks/useContainerHeight'
import styles from './UsersTable.module.css'

const handleSearch = confirm => {
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
				onPressEnter={() => handleSearch(confirm)}
				style={{ marginBottom: 8, display: 'block' }}
			/>
			<div style={{ display: 'flex', gap: 8 }}>
				<Button type='primary' onClick={() => handleSearch(confirm)} size='small'>
					جستجو
				</Button>
				<Button onClick={() => handleReset(clearFilters, confirm)} size='small'>
					حذف فیلتر
				</Button>
			</div>
		</div>
	),
	onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
})

const roleLabels = {
	admin: 'مدیر',
	irrigator: 'میراب',
	landOwner: 'مالک زمین',
}

const roleFilters = Object.entries(roleLabels).map(([value, text]) => ({ text, value }))

const statusFilters = [
	{ text: 'فعال', value: 'active' },
	{ text: 'غیرفعال', value: 'inactive' },
]

const columns = [
	{
		dataIndex: 'profilePicture',
		key: 'profilePicture',
		width: 52,
		render: (_, record) => {
			return record?.profilePicture?.url ? (
				<Avatar src={record.profilePicture.url} size={35} icon={<UserOutlined />} />
			) : (
				<Avatar size={35} icon={<UserOutlined />} />
			)
		},
	},
	{
		title: 'نام و نام‌خانوادگی',
		dataIndex: 'fullName',
		key: 'fullName',
		width: 211,
		...getColumnSearchProps('fullName'),
		render: (_, record) => <Link to={record._id}>{record.fullName}</Link>,
	},
	{
		title: 'نقش',
		dataIndex: 'role',
		key: 'role',
		width: 211,
		filters: roleFilters,
		onFilter: (value, record) => record.role === value,
		render: role => roleLabels[role] || role,
	},
	{
		title: 'شماره تماس',
		dataIndex: 'mobile',
		key: 'mobile',
		width: 211,
		...getColumnSearchProps('mobile'),
	},
	{
		title: 'آدرس ایمیل',
		dataIndex: 'email',
		key: 'email',
		width: 211,
		render: email => email || '--',
	},
	{
		title: 'کد حساب‌داری',
		dataIndex: 'accountingCode',
		key: 'accountingCode',
		width: 211,
		...getColumnSearchProps('accountingCode'),
		render: accountingCode => accountingCode || '--',
	},
	{
		title: 'وضعیت',
		dataIndex: 'status',
		key: 'status',
		width: 211,
		filters: statusFilters,
		onFilter: (value, record) => record.status === value,
		render: status => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'فعال' : 'غیرفعال'}</Tag>,
	},
]

const UsersTable = ({ usersData }) => {
	const [containerRef, height] = useContainerHeight(40)

	return (
		<div ref={containerRef}>
			<Table
				size='middle'
				pagination={{
					position: ['bottomCenter'],
					total: usersData.length,
				}}
				className={styles.table}
				columns={columns}
				dataSource={usersData}
				rowKey={record => record._id}
				bordered
				scroll={{ y: height }}
			/>
		</div>
	)
}

export default React.memo(UsersTable)
