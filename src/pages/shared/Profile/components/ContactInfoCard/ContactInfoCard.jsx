import { Card, Typography, Button, Flex, Form } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useParams } from 'react-router'

import ContactInfoDisplay from './components/ContactInfoDisplay/ContactInfoDisplay'
import ContactInfoModal from './components/ContactInfoModal/ContactInfoModal'
import useAPI from '../../../../../hooks/useAPI'

const { Title } = Typography

const ContactInfoCard = () => {
	const [isShowModal, setIsShowModal] = useState(false)
	const [form] = Form.useForm()
	const api = useAPI()
	const { userId } = useParams()

	api.init(userId ? `users/${userId}` : `me`)

	const handleOpenModal = () => {
		setIsShowModal(true)
		form.setFieldsValue(api.data.user)
		console.log(api.data.user)
		console.log(api.isLoading)
	}

	const handleCloseModal = () => {
		setIsShowModal(false)
		form.resetFields()
		console.log(api.data.user)
		console.log(api.isLoading)
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

			<ContactInfoModal open={isShowModal} onClose={handleCloseModal} form={form} />
		</>
	)
}

export default ContactInfoCard
