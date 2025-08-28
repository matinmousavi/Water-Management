import { Card, Flex, Table, Typography } from 'antd'
import moment from 'moment-jalaali'
import { EyeOutlined } from '@ant-design/icons'
import GroupEditLogs from './components/GroupEditLogs/GroupEditLogs'

const GroupLogs = ({ logs }) => {
	const { Title } = Typography
	const columns = [
		{
			title: 'تاریخ ',
			render: record => (record?.startedAt ? moment(record.startedAt).locale('fa').format('dddd jD jMMMM jYYYY') : '--'),
		},
		{
			title: 'ساعت شروع',
			render: record => (record?.startedAt ? moment(record.startedAt).locale('fa').format('HH:mm') : '--'),
		},
		{
			title: 'مدت زمان آبیاری',
			key: 'duration',
			render: (_, record) => {
				if (!record.endedAt) return 'در حال آبیاری'
				return `${record.duration}`
			},
		},
		{
			title: 'توضیحات',
			dataIndex: ['note'],
			key: 'note',
			render: (_, record) => (record?.note ? <EyeOutlined className='eye-icon' onClick={() => handleViewNote(record)} /> : '--'),
		},
	]
	return (
		<Card>
			<Flex gap={36} vertical>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-card-title'>
						لاگ توزیع آب ({2})
					</Title>
					<GroupEditLogs />
				</Flex>
				<Table bordered dataSource={logs} columns={columns} />
			</Flex>
		</Card>
	)
}

export default GroupLogs
