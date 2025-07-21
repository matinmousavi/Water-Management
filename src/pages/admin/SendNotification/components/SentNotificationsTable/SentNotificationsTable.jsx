import React from 'react'
import { Table } from 'antd'
import { Link } from 'react-router-dom'

const SentNotificationsTable = ({ data }) => {
	const columns = [
		{
			title: 'تاریخ',
			dataIndex: 'title',
			key: 'date',
			filterSearch: true,
			render: (title, record) => <Link to={`/lands/${record._id}`}>{title || '-'}</Link>,
		},
		{
			title: 'ساعت',
			key: 'time',
			render: (_, record) => {
				const first = record.owner?.firstName || '-'
				const last = record.owner?.lastName || ''
				return record.owner?._id ? <Link to={`/users/${record.owner._id}`}>{`${first} ${last}`.trim()}</Link> : '-'
			},
		},
		{
			title: 'گروه مخاطب',
			dataIndex: ['owner', 'mobile'],
			key: 'audienceGroup',
			render: (_, record) => record.owner?.mobile || '-',
		},
		{
			title: 'محتوای پیامک',
			dataIndex: 'message',
			key: 'messageContent',
			render: text => text || '-',
		},
	]

	return (
		<Table
			columns={columns}
			rowKey='_id'
			dataSource={data}
			pagination={{
				position: ['bottomCenter'],
				total: data.length,
				pageSize: 6,
			}}
			scroll={{ x: 'max-content' }}
			bordered
		/>
	)
}

export default SentNotificationsTable
