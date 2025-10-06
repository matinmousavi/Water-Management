import { Modal, Table } from 'antd'

const DelayModal = ({ visible, onCancel, data }) => {
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
		<Modal title='تاخیر در آبیاری امروز' open={visible} onCancel={onCancel} footer={null} width={684} centered>
			<Table
				columns={columns}
				dataSource={data || []}
				rowKey={(record, index) =>
					record.land?.id || record.landGroup?.id ? `${record.well?.id}-${record.land?.id || record.landGroup?.id}` : `${record.well?.id}-${index}`
				}
				pagination={false}
				scroll={{ y: 400 }}
				bordered
				size='middle'
			/>
		</Modal>
	)
}

export default DelayModal
