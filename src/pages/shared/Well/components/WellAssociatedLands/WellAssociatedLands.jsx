import { Button, Card, Col, Flex, Form, Modal, Popconfirm, Space, Table, Typography } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import { useState } from 'react'
import { DeleteTwoTone } from '@ant-design/icons'

import useNotification from '../../../../../hooks/useNotification'
import { Link } from 'react-router'
import WellModalLands from '../WellModalLands/WellModalLands'
import english2persian from '../../../../../utils/english2persian'

const WellAssociatedLands = ({ id, wellData, setWellData }) => {
	const { Title } = Typography
	const wellApi = useAPI()
	const [isShowModal, setIsShowModal] = useState(false)
	const { openNotification } = useNotification()
	const [form] = Form.useForm()

	const handleCancelModal = () => {
		setIsShowModal(false)
	}

	const handleOpenModal = () => {
		setIsShowModal(true)
	}

	const onSubmitLands = async () => {
		try {
			const values = await form.validateFields()
			const response = await wellApi.patch(`wells/${id}`, { lands: values?.lands })
			if (!response?.error) {
				setWellData(response)
				setIsShowModal(false)
				form.resetFields()
				openNotification('success', 'زمین به چاه اضافه شد')
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
			const updatedLands = wellData.lands.filter(item => item._id !== landId)
			const response = await wellApi.patch(`wells/${id}`, { lands: updatedLands })

			if (!response?.error) {
				openNotification('success', 'زمین از چاه حذف شد')
				setWellData(response)
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
				return `${owner?.firstName} ${owner?.lastName}`
			},
		},
		{
			title: 'شماره تماس',
			dataIndex: ['owner', 'mobile'],
			key: 'mobile',
			render: mobile => english2persian(mobile) || '--',
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
						<Popconfirm title='آیا اطمینان دارید؟' cancelText='خیر' okText='بله' onConfirm={() => handleDelete(record._id)}>
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
						{wellData?.lands?.length}
						{')'}
					</Title>
					<Button onClick={handleOpenModal} type='dashed'>
						افزودن زمین
					</Button>
				</Flex>
				<Table dataSource={wellData?.lands} columns={columns} rowKey={record => record._id} />
			</Flex>
			<WellModalLands handleSubmit={onSubmitLands} api={wellApi} form={form} onClose={handleCancelModal} open={isShowModal} />
		</Card>
	)
}
export default WellAssociatedLands
