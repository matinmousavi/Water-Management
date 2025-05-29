import { Button, Card, Col, DatePicker, Flex, Form, Input, Modal, Row, Table, Typography } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import useAPI from '../../../../../hooks/useAPI'
import { useState } from 'react'
import { data } from 'react-router'
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
		dataIndex: 'lastDateIrrigation',
		key: 'lastDateIrrigation',
	},
	{
		title: 'زمان آبیاری بعدی',
		dataIndex: 'nextDateIrrigation',
		key: 'nextDateIrrigation',
	},
	{
		title: 'عملیات',
		dataIndex: 'action',
		key: 'action',
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
	const [landsData, setLandsData] = useState()
	wellApi.init(`wells/${id}`)
	const [form] = Form.useForm()
	console.log(wellApi.data?.well)

	const handleCancelModal = () => {
		setIsShowModal(false)
		form.resetFields()
	}
	const handleOpenModal = () => {
		setIsShowModal(true)
	}
	const onFinish = async () => {
		try {
			const values = await form.validateFields()
			const currentWell = wellApi.data?.well || []
			const currentLands = wellApi.data?.well?.lands
			const response = await wellApi.patch(`wells/${id}`, { ...currentWell, lands: [...currentLands, values] })
			if (!response?.error) {
				setIsShowModal(false)
				setLandsData(response)
				form.resetFields()
			}
		} catch (error) {
			console.log('Error:', error)
		}
	}
	return (
		<Card>
			<Flex vertical gap={10}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						لیست زمین ها
					</Title>
					<Button onClick={handleOpenModal} type='dashed'>
						افزودن زمین
					</Button>
				</Flex>
				<Table columns={columns} />
			</Flex>

			<Modal onOk={onFinish} okText='ذخیره' cancelText='انصراف' title='افزودن زمین به چاه' open={isShowModal} onCancel={handleCancelModal}>
				<Form form={form} layout='vertical' size='large'>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='name' label='عنوان زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='owner' label='مالک' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='mobile'
								label='شماره تماس'
								rules={[
									{ required: true, message: 'شماره موبایل الزامی است' },
									{
										pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
										message: 'شماره موبایل معتبر نیست!',
									},
								]}
							>
								<Input maxLength={11} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='lastDateIrrigation' label='آخرین زمان آبیاری'>
								<DatePicker />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='nextDateIrrigation' label='زمان آبیاری بعدی'>
								<DatePicker />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</Card>
	)
}
export default WellAssociatedLands
