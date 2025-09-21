import { Modal, Table } from 'antd'

const DelayModal = ({ visible, onCancel, data }) => {
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
		<Modal title='تاخیر در آبیاری امروز' open={visible} onCancel={onCancel} footer={null} width={684}>
			<Table columns={columns} dataSource={data} pagination={false} scroll={{ y: 400 }} bordered size='middle' />
		</Modal>
	)
}

export default DelayModal
