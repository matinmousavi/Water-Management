import { Button, Card, Col, Flex, Form, Modal, Popconfirm, Space, Table, Typography } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import { useState } from 'react'
import { DeleteTwoTone } from '@ant-design/icons'

import useNotification from '../../../../../hooks/useNotification'
import SelectLands from '../SelectLands/SelectLands'
import { Link } from 'react-router'

const WellAssociatedLands = ({ id }) => {
	const { Title } = Typography
	const wellApi = useAPI()
	const [isShowModal, setIsShowModal] = useState(false)
	const { openNotification } = useNotification()
	wellApi.init(`wells/${id}`, { well: { lands: [] } })
	const [form] = Form.useForm()

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
			const newResponse = { ...wellApi?.data?.well, lands: values?.lands }
			const response = await wellApi.patch(`wells/${id}`, newResponse)
			if (!response?.error) {
				setIsShowModal(false)
				form.resetFields()
				openNotification('success', 'زمین به چاه اضافه شد')
				await wellApi.get(`wells/${id}`)
			}
		} catch (error) {
			console.error('Error:', error)
			if (error.errorFields) {
				openNotification('error', error.errorFields[0]?.errors[0])
			} else {
				openNotification('error', error?.error?.message || 'خطای ناشناخته')
			}
		}
	}
	const handleDelete = async landId => {
		try {
			const currentWell = { ...wellApi.data?.well }

			const updatedLands = currentWell.lands.filter(item => item._id !== landId)

			const updatedWell = { ...currentWell, lands: updatedLands }

			const response = await wellApi.patch(`wells/${id}`, updatedWell)

			if (!response?.error) {
				openNotification('success', 'زمین از چاه حذف شد')
				await wellApi.get(`wells/${id}`)
			}
		} catch (error) {
			console.error('Error:', error)
			openNotification('error', error?.error?.message || 'خطا در حذف زمین')
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
			render: owner => {
				return `${owner.firstName} ${owner.lastName}`
			},
		},
		{
			title: 'شماره تماس',
			dataIndex: ['owner', 'mobile'],
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
						<Popconfirm title='آیا اظمینان دارید؟' cancelText='خیر' okText='بله' onConfirm={() => handleDelete(record._id)}>
							<DeleteTwoTone twoToneColor='#ff0000' />
						</Popconfirm>
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
						{wellApi.data?.well?.lands.length}
						{')'}
					</Title>
					<Button onClick={handleOpenModal} type='dashed'>
						افزودن زمین
					</Button>
				</Flex>
				<Table dataSource={wellApi.data?.well?.lands || []} columns={columns} />
			</Flex>
			<Modal onOk={onFinish} okText='ذخیره' cancelText='انصراف' title='افزودن زمین به چاه' open={isShowModal} onCancel={handleCancelModal}>
				<Form form={form} layout='vertical' size='large'>
					<Flex align='center' justify='center'>
						<Col span={16}>
							<Form.Item name='lands' label='زمین ها'>
								<SelectLands defalutValues={wellApi.data?.well?.lands.map(item => item.name) || []} />
							</Form.Item>
						</Col>
					</Flex>
				</Form>
			</Modal>
		</Card>
	)
}
export default WellAssociatedLands
