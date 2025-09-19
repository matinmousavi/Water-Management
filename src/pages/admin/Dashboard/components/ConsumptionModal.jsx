import { Modal, Table } from 'antd'

const ConsumptionModal = ({ visible, onCancel, data }) => {
	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: 'wellName',
			key: 'wellName',
		},
		{
			title: 'زمین/گروه',
			dataIndex: 'land',
			key: 'land',
		},
		{
			title: 'ساعت شروع',
			dataIndex: 'startTime',
			key: 'startTime',
		},
		{
			title: 'ساعت پایان',
			dataIndex: 'endTime',
			key: 'endTime',
		},
	]

	return (
		<Modal title='مصرف خارج از برنامه' open={visible} onCancel={onCancel} footer={null} width={800} centered>
			<Table columns={columns} dataSource={data} pagination={false} size='middle' bordered />
		</Modal>
	)
}

export default ConsumptionModal
