import { Button, Card, Col, DatePicker, Flex, Form, Input, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import useAPI from '../../../../../hooks/useAPI'
import { useState } from 'react'
import SelectOwner from '../../../../../components/SelectOwner/SelectOwner'
import useNotification from '../../../../../hooks/useNotification'

const WellAssociatedLands = ({ id }) => {
	const { Title } = Typography
	const wellApi = useAPI()
	const ownerApi = useAPI()
	const [isShowModal, setIsShowModal] = useState(false)
	const [landsData, setLandsData] = useState([])
	const { openNotification } = useNotification()
	wellApi.init(`wells/${id}`)
	const [form] = Form.useForm()

	const handleCancelModal = () => {
		setIsShowModal(false)
		form.resetFields()
	}
	const handleOpenModal = () => {
		setIsShowModal(true)
	}
	console.log('main data well:', wellApi.data.well)

	const onFinish = async () => {
		try {
			const values = await form.validateFields()
			const responseOwner = await ownerApi.get(`users/${values.owner._id}`)
			const newLands = {
				...values,
				mobile: responseOwner?.owner?.mobile,
				name: responseOwner?.owner?.name,
			}
			const currentWell = wellApi.data?.well || []
			const currentLands = wellApi.data?.well?.lands
			const param = { ...currentWell, lands: [...currentLands, newLands] }
			console.log('new data for send land to well: ', param)

			const response = await wellApi.patch(`wells/${id}`, param)
			if (!response?.error) {
				setIsShowModal(false)
				setLandsData(response)
				form.resetFields()
				openNotification('success', 'زمین به چاه اضافه شد')
			}
		} catch (error) {
			console.log('Error:', error)
			if (error.errorFields) {
				openNotification('error', error.errorFields[0]?.errors[0])
			} else {
				openNotification('error', error?.error?.message || 'خطای ناشناخته')
			}
		}
	}
	const handleDelete = async id => {
		const response = await wellApi.patch(`wells/${id}`)
		if (response.error) {
			openNotification('error', response.error.message)
		} else {
			openNotification('success', 'زمین مورد نظر از چاه حذف شد.')
			wellApi.get(`wells/${id}`)
		}
	}
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
			render: record => `${record.owner.firstName} ${record.owner.lastName}`,
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
			render: (_, record) => {
				return (
					<Space>
						<Popconfirm title='آیا اظمینان دارید؟' cancelText='خیر' okText='بله' onConfirm={() => handleDelete(record._id)}></Popconfirm>
					</Space>
				)
			},
		},
	]
	return (
		<Card>
			<Flex vertical gap={10}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						لیست زمین ها {'('}
						{landsData.length}
						{')'}
					</Title>
					<Button onClick={handleOpenModal} type='dashed'>
						افزودن زمین
					</Button>
				</Flex>
				<Table dataSource={landsData} columns={columns} />
			</Flex>
			<Modal onOk={onFinish} okText='ذخیره' cancelText='انصراف' title='افزودن زمین به چاه' open={isShowModal} onCancel={handleCancelModal}>
				<Form form={form} layout='vertical' size='large'>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='owner' label='مالک' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
								<SelectOwner />
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
