import { Modal, Table, Flex } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const ConsumptionModal = ({ visible, onCancel }) => {
	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: 'wellTitle',
			key: 'wellTitle',
		},
		{
			title: 'نام زمین',
			dataIndex: 'fieldName',
			key: 'fieldName',
		},
		{
			title: 'میزان مصرف خارج از برنامه',
			dataIndex: 'consumptionAmount',
			key: 'consumptionAmount',
			render: text => (
				<Flex align='center' justify='space-between'>
					{text}
					<ArrowUpOutlined style={{ color: '#FF4D4F', fontSize: '18px' }} />
				</Flex>
			),
		},
	]
	const data = [
		{
			key: '1',
			wellTitle: 'نام چاه',
			fieldName: 'نام زمین',
			consumptionAmount: '53 دقیقه',
		},
		{
			key: '2',
			wellTitle: 'نام چاه',
			fieldName: 'نام زمین',
			consumptionAmount: '3 دقیقه',
		},
		{
			key: '3',
			wellTitle: 'نام چاه',
			fieldName: 'نام زمین',
			consumptionAmount: '1 ساعت و 2 دقیقه',
		},
	]
	return (
		<Modal title='مصرف خارج از برنامه' open={visible} onCancel={onCancel} footer={null} width={800} centered>
			<Table columns={columns} dataSource={data} pagination={false} size='middle' bordered />
		</Modal>
	)
}
export default ConsumptionModal
