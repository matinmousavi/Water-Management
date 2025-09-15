import { Modal, Table } from 'antd'

const delayModalData = [
	{
		key: 1,
		place: 'نام چاه',
		land: 'نام زمین',
		startTime: '17:42',
		duration: '18:30',
		delayStatus: '52 دقیقه',
		webStatus: '%27',
	},
	{
		key: 2,
		place: 'نام چاه',
		land: 'نام زمین',
		startTime: '17:42',
		duration: '18:00',
		delayStatus: '3 دقیقه',
		webStatus: '%52',
	},
	{
		key: 3,
		place: 'نام چاه',
		land: 'نام زمین',
		startTime: '17:42',
		duration: '18:30',
		delayStatus: '1 ساعت و 2 دقیقه',
		webStatus: '2.100',
	},
]

const DelayModal = ({ visible, onCancel }) => {
	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: 'place',
			key: 'place',
		},
		{
			title: 'نام زمین',
			dataIndex: 'land',
			key: 'land',
		},
		{
			title: 'میزان تاخیر',
			dataIndex: 'delayStatus',
			key: 'delayStatus',
			render: text => {
				return <span>{text}</span>
			},
		},
	]

	return (
		<Modal title='تاخیر در آبیاری امروز' open={visible} onCancel={onCancel} footer={null} width={684}>
			<Table columns={columns} dataSource={delayModalData} pagination={false} scroll={{ y: 400 }} bordered size='middle' />
		</Modal>
	)
}

export default DelayModal
