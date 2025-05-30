import { Card, Typography, Button, Flex, Form } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useState } from 'react'
import styles from './ContactInfoCard.module.css'

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
			<Card className={styles.card}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						مشخصات کاربر{' '}
					</Title>
					<Button type='default' color='primary' icon={<EditOutlined />} size='middle' onClick={handleOpenModal} disabled={api.isLoading}>
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
