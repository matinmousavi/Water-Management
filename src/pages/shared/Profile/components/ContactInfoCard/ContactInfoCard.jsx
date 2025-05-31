import { Card, Typography, Button, Flex, Form } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useState } from 'react'

import ContactInfoDisplay from './components/ContactInfoDisplay/ContactInfoDisplay'
import ContactInfoModal from './components/ContactInfoModal/ContactInfoModal'

const { Title } = Typography

const ContactInfoCard = ({ api }) => {
	const [isShowModal, setIsShowModal] = useState(false)
	const [form] = Form.useForm()

	const handleOpenModal = () => {
		setIsShowModal(true)
		form.setFieldsValue(api.data.user)
	}

	const handleCloseModal = () => {
		setIsShowModal(false)
		form.resetFields()
	}

	return (
		<>
			<Card>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						اطلاعات شخصی
					</Title>
					<Button type='default' shape='round' icon={<EditOutlined />} size='middle' onClick={handleOpenModal} disabled={api.isLoading}>
						ویرایش
					</Button>
				</Flex>

				<ContactInfoDisplay user={api.data.user} />
			</Card>

			<ContactInfoModal open={isShowModal} onClose={handleCloseModal} api={api} form={form} />
		</>
	)
}

export default ContactInfoCard
