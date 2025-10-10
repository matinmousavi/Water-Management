import { Table, Tag, Input } from 'antd'
import { Link } from 'react-router'
import { useUser } from '../../../../../contexts/UserContext'
import useContainerHeight from '../../../../../hooks/useContainerHeight'
import { useState, useEffect, useRef } from 'react'

const WellsTable = ({ WellsData }) => {
	const { isIrrigator, isAdmin } = useUser()
	const [containerRef, height] = useContainerHeight(40)
	const [pageSize, setPageSize] = useState(6)
	const tableWrapperRef = useRef(null)

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
	}, [height, WellsData])

	const getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					placeholder={`جستجو ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={confirm}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<a onClick={confirm}>اعمال</a>
					<a
						onClick={() => {
							clearFilters()
							confirm()
						}}
					>
						پاک‌سازی
					</a>
				</div>
			</div>
		),
		onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
	})

	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: 'title',
			width: 100,
			key: 'title',
			render: (text, record) => <Link to={`/wells/${record._id}`}>{text}</Link>,
			...getColumnSearchProps('title'),
		},
		{
			title: 'میرآب',
			dataIndex: 'irrigator',
			key: 'irrigator',
			render: (irrigator, record) =>
				irrigator?._id ? (
					isAdmin ? (
						<Link to={isIrrigator ? `/wells/${record._id}` : `/users/${irrigator._id}`}>{irrigator.fullName}</Link>
					) : (
						irrigator.fullName
					)
				) : (
					<span>-</span>
				),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder='جستجو میرآب'
						value={selectedKeys[0]}
						onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
						onPressEnter={confirm}
						style={{ marginBottom: 8, display: 'block' }}
					/>
					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<a onClick={confirm}>اعمال</a>
						<a
							onClick={() => {
								clearFilters()
								confirm()
							}}
						>
							پاک‌سازی
						</a>
					</div>
				</div>
			),
			onFilter: (value, record) => `${record.irrigator?.fullName ?? ''}`.toLowerCase().includes(value.toLowerCase()),
		},
		{
			title: 'تعداد زمین',
			dataIndex: 'lands',
			key: 'lands',
			render: lands => (Array.isArray(lands) ? lands.length : 0),
		},
		{
			title: 'وضعیت',
			dataIndex: 'status',
			key: 'status',
			render: status => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'فعال' : 'غیرفعال'}</Tag>,
			filters: [
				{ text: 'فعال', value: 'active' },
				{ text: 'غیرفعال', value: 'inactive' },
			],
			onFilter: (value, record) => record.status === value,
		},
	]

	return (
		<div ref={containerRef}>
			<div ref={tableWrapperRef}>
				<Table
					size='middle'
					columns={columns}
					dataSource={WellsData}
					rowKey={record => record._id}
					pagination={
						WellsData.length > pageSize
							? {
									position: ['bottomCenter'],
									total: WellsData.length,
									pageSize,
									showSizeChanger: false,
								}
							: false
					}
					scroll={{ y: height }}
					bordered
				/>
			</div>
		</div>
	)
}

export default WellsTable
