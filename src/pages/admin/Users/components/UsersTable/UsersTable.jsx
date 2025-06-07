import { Avatar, Button, Input, Table } from 'antd'
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
				onPressEnter={() => handleSearch(selectedKeys, confirm)}
				style={{ marginBottom: 8, display: 'block' }}
			/>
			<div style={{ display: 'flex', gap: 8 }}>
				<Button type='primary' onClick={() => handleSearch(selectedKeys, confirm)} icon={<SearchOutlined />} size='small'>
					جستجو
				</Button>
				<Button onClick={() => handleReset(clearFilters, confirm)} size='small' icon={<CloseOutlined />}>
					حذف فیلتر
				</Button>
			</div>
		</div>
	),
	filterIcon: <SearchOutlined />,
	onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
})

const roleLabels = {
	admin: 'مدیر',
	irrigator: 'میراب',
	landOwner: 'مالک زمین',
}

const columns = [
	{
		title: <Avatar size={35} icon={<UserOutlined />} style={{ visibility: 'hidden' }} />,
		dataIndex: 'profilePicture',
		key: 'profilePicture',
		width: 50,
		render: (_, record) => {
			return record?.profilePicture?.url ? (
				<Avatar src={record.profilePicture?.url} size={35} icon={<UserOutlined />} />
			) : (
				<Avatar size={35} icon={<UserOutlined />} />
			)
		},
	},
	{
		title: 'نام و نام خانوادگی',
		dataIndex: 'firstName',
		key: 'firstName',
		render: (_, record) => (
			<Link to={record._id}>
				{record?.firstName} {record?.lastName}
			</Link>
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
		...getColumnSearchProps('mobile'),
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
	const [containerRef, height] = useContainerHeight(40)

	return (
		<div ref={containerRef}>
			<Table
				pagination={{
					position: ['bottomCenter'],
					total: usersData.length,
				}}
				className={styles.table}
				columns={columns}
				dataSource={usersData}
				rowKey={record => record._id}
				size='small'
				bordered
				scroll={{ y: height }}
			/>
		</div>
	)
}

export default React.memo(UsersTable)
