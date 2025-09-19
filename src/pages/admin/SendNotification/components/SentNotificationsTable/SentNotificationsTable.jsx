import { Table } from 'antd'
import moment from 'moment-jalaali'

moment.loadPersian({ usePersianDigits: true })

const recipientGroupLabels = {
	all: 'همه',
	admin: 'ادمین‌ها',
	irrigator: 'میراب‌ها',
	landOwner: 'مالکین زمین',
}

const SentNotificationsTable = ({ data }) => {
	const columns = [
		{
			title: 'تاریخ',
			dataIndex: 'sentAt',
			key: 'date',
			width: 180,
			render: date => (date ? moment(date).format('jD jMMMM jYYYY') : '-'),
		},
		{
			title: 'ساعت',
			dataIndex: 'sentAt',
			key: 'time',
			width: 180,
			render: date => (date ? moment(date).format('HH:mm') : '-'),
		},
		{
			title: 'ارسال‌کننده',
			dataIndex: ['sentBy', 'fullName'],
			key: 'sentBy',
			width: 180,
			render: (_, record) => record.sentBy?.fullName || '-',
		},
		{
			title: 'گروه مخاطب',
			dataIndex: 'recipientGroup',
			key: 'audienceGroup',
			width: 200,
			render: groups => (Array.isArray(groups) && groups.length > 0 ? groups.map(g => recipientGroupLabels[g] || g).join(' - ') : '-'),
		},
		{
			title: 'محتوای پیامک',
			dataIndex: 'message',
			key: 'messageContent',
			render: message => message || '-',
		},
	]

	return (
		<Table
			size='middle'
			columns={columns}
			rowKey='id'
			dataSource={data}
			pagination={{
				position: ['bottomCenter'],
				total: data?.length,
				pageSize: 6,
			}}
			scroll={{ x: 'max-content' }}
			bordered
		/>
	)
}

export default SentNotificationsTable
