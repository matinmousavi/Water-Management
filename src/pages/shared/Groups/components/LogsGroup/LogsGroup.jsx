import { Button, Card, Flex, Table } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import moment from 'moment-jalaali'
import styles from './LogsGroup.module.css'

const LogsGroup = () => {
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
		<Flex>
			<Card>
				<Table columns={columns} />
			</Card>

			<div className={styles.footer}>
				<Button type='default' onClick={() => setOpen(true)} className={`button-modal ${styles.buttonStart}`}>
					شروع آبیاری
				</Button>
			</div>
		</Flex>
	)
}

export default LogsGroup
