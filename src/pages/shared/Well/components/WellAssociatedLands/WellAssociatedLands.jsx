import { Button, Card, Flex, Modal, Table, Typography } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import useAPI from '../../../../../hooks/useAPI'
import { useState } from 'react'
const columns = [
	{
		title: 'عنوان زمین',
		dataIndex: 'name',
		key: 'name',
		render: (name, record) => <Link to={`/lands/${record._id}`}>{name}</Link>,
	},
	{
		title: 'مالک زمین',
		dataIndex: 'owner',
		key: 'owner',
		render: (_, record) => `${record.owner.firstName} ${record.owner.lastName}`,
	},
	{
		title: 'شماره تماس',
		dataIndex: 'mobile',
		key: 'mobile',
	},
	{
		title: 'آخرین زمان آبیاری',
		dataIndex: 'lastIrrigation',
		key: 'lastIrrigation',
	},
	{
		title: 'زمان آبیاری بعدی',
		dataIndex: '',
		key: '',
	},
	{
		title: 'عملیات',
		dataIndex: '',
		key: '',
		render: record => {
			return (
				<Button>
					<DeleteTwoTone />
				</Button>
			)
		},
	},
]
const WellAssociatedLands = ({ id }) => {
	const { Title } = Typography
	const wellApi = useAPI()
	const [isShowModal, setIsShowModal] = useState(false)
	wellApi.init(`wells/${id}`)
	console.log(wellApi.data.well?.lands)
	const handleCancelModal = () => {
		setIsShowModal(false)
	}
	const handleOpenModal = () => {
		setIsShowModal(true)
	}
	return (
		<Card>
			<Flex align='center' justify='space-between'>
				<Title level={2} className='text-h2'>
					لیست زمین ها
				</Title>
				<Button onClick={handleOpenModal} type='primary'>
					افزودن زمین
				</Button>
			</Flex>
			<Table columns={columns} />

			<Modal title='افزودن زمین به چاه' centered open={isShowModal} onCancel={handleCancelModal} footer={null}></Modal>
		</Card>
	)
}
export default WellAssociatedLands
