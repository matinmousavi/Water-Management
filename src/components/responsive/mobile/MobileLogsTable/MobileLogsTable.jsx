import { Spin, Table } from 'antd'
import moment from 'moment-jalaali'
import DescriptionModalCell from '../DescriptionModalCell/DescriptionModalCell'
import styles from './MobileLogsTable.module.css'

const MobileLogsTable = ({ logs = [], descriptionEditHours }) => {
	const columns = [
		{
			title: 'تاریخ',
			dataIndex: 'startedAt',
			key: 'date',
			render: value => (
				<p className={styles.date}>
					<span>{moment(value).format('dddd ')}</span>
					<span>{moment(value).format('jD jMMMM jYYYY ')}</span>
				</p>
			),
		},
		{
			title: 'ساعت شروع',
			dataIndex: 'startedAt',
			key: 'startTime',
			render: value => (value ? moment(value).format('HH:mm') : '--'),
		},
		{
			title: 'مدت زمان آبیاری',
			key: 'duration',
			render: (_, record) => {
				if (record?.isOngoing) return 'در حال آبیاری'
				const timeStr = record?.receivedWater || record?.duration
				if (!timeStr) return <Spin size='small' />
				const [h, m] = timeStr.split(':').map(Number)
				return h === 0 ? `${m} دقیقه` : `${h} ساعت${m > 0 ? ` و ${m} دقیقه` : ''}`
			},
		},
		{
			title: 'توضیحات',
			key: 'note',
			render: (_, record) => <DescriptionModalCell record={record} descriptionEditHours={descriptionEditHours} />,
		},
	]

	return (
		<Table
			size='middle'
			rowKey='_id'
			bordered
			scroll={{ x: 'max-content' }}
			pagination={false}
			className={styles.table}
			dataSource={logs}
			columns={columns}
		/>
	)
}

export default MobileLogsTable
