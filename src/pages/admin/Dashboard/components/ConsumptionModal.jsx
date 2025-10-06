import { Modal, Table } from 'antd'

const ConsumptionModal = ({ visible, onCancel, data }) => {
	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: ['well', 'title'],
			key: 'well',
			render: (_, record) => record.well?.title || '---',
		},
		{
			title: 'زمین / گروه',
			key: 'landOrGroup',
			render: (_, record) => record.land?.title || record.landGroup?.title || '---',
		},
		{
			title: 'ساعت شروع',
			dataIndex: 'startTime',
			key: 'startTime',
			render: value => value || '---',
		},
		{
			title: 'ساعت پایان',
			dataIndex: 'endTime',
			key: 'endTime',
			render: value => value || '---',
		},
	]

	return (
		<Modal title='مصرف خارج از برنامه' open={visible} onCancel={onCancel} footer={null} width={800} centered>
			<Table
				columns={columns}
				dataSource={data || []}
				rowKey={(record, index) =>
					record.land?.id || record.landGroup?.id ? `${record.well?.id}-${record.land?.id || record.landGroup?.id}` : `${record.well?.id}-${index}`
				}
				pagination={false}
				size='middle'
				bordered
			/>
		</Modal>
	)
}

export default ConsumptionModal
