import { Avatar, Button, Input, Table, Tag } from 'antd'
import { Link } from 'react-router'
import { UserOutlined } from '@ant-design/icons'
import React, { useState, useEffect, useRef } from 'react'
import useContainerHeight from '../../../../../hooks/useContainerHeight'
import styles from './UsersTable.module.css'

const handleSearch = confirm => confirm()
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

const roleLabels = { admin: 'مدیر', irrigator: 'میراب', landOwner: 'مالک زمین' }
const roleFilters = Object.entries(roleLabels).map(([value, text]) => ({ text, value }))
const statusFilters = [
	{ text: 'فعال', value: 'active' },
	{ text: 'غیرفعال', value: 'inactive' },
]

const UsersTable = ({ usersData }) => {
	const [containerRef, height] = useContainerHeight(40)
	const [pageSize, setPageSize] = useState(6)
	const tableWrapperRef = useRef(null)
	const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024)

	useEffect(() => {
		const handleResize = () => setIsSmallScreen(window.innerWidth < 1024)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	useEffect(() => {
		if (!tableWrapperRef.current) return
		const firstRow = tableWrapperRef.current.querySelector('.ant-table-row')
		if (firstRow) {
			const rowHeight = firstRow.getBoundingClientRect().height
			if (rowHeight > 0) {
				const visibleRows = Math.floor(height / rowHeight)
				setPageSize(visibleRows > 0 ? visibleRows : 1)
			}
		}
	}, [height, usersData])

	const colWidth = isSmallScreen ? 211 : undefined

	const columns = [
		{
			dataIndex: 'profilePicture',
			key: 'profilePicture',
			width: 52,
			render: (_, record) =>
				record?.profilePicture?.url ? (
					<Avatar src={record.profilePicture.url} size={35} icon={<UserOutlined />} />
				) : (
					<Avatar size={35} icon={<UserOutlined />} />
				),
		},
		{
			title: 'نام و نام‌خانوادگی',
			dataIndex: 'fullName',
			key: 'fullName',
			width: colWidth,
			...getColumnSearchProps('fullName'),
			render: (_, record) => <Link to={record._id}>{record.fullName}</Link>,
		},
		{
			title: 'نقش',
			dataIndex: 'role',
			key: 'role',
			width: colWidth,
			filters: roleFilters,
			onFilter: (value, record) => record.role === value,
			render: role => roleLabels[role] || role,
		},
		{
			title: 'شماره تماس',
			dataIndex: 'mobile',
			key: 'mobile',
			width: colWidth,
			...getColumnSearchProps('mobile'),
		},
		{
			title: 'آدرس ایمیل',
			dataIndex: 'email',
			key: 'email',
			width: colWidth,
			render: email => email || '--',
		},
		{
			title: 'کد حساب‌داری',
			dataIndex: 'accountingCode',
			key: 'accountingCode',
			width: colWidth,
			...getColumnSearchProps('accountingCode'),
			render: accountingCode => accountingCode || '--',
		},
		{
			title: 'وضعیت',
			dataIndex: 'status',
			key: 'status',
			width: colWidth,
			filters: statusFilters,
			onFilter: (value, record) => record.status === value,
			render: status => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'فعال' : 'غیرفعال'}</Tag>,
		},
	]

	return (
		<div ref={containerRef}>
			<div ref={tableWrapperRef}>
				<Table
					size='middle'
					pagination={
						usersData.length > pageSize
							? {
									position: ['bottomCenter'],
									total: usersData.length,
									pageSize,
									showSizeChanger: false,
							  }
							: false
					}
					className={styles.table}
					columns={columns}
					dataSource={usersData}
					rowKey={record => record._id}
					bordered
					scroll={{
						x: isSmallScreen ? 'max-content' : false,
					}}
				/>
			</div>
		</div>
	)
}

export default React.memo(UsersTable)
