import { Card, Typography, Button, Flex, Form } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useCallback, useState } from 'react'

import ContactInfoDisplay from './components/ContactInfoDisplay/ContactInfoDisplay'
import ContactInfoModal from './components/ContactInfoModal/ContactInfoModal'
import useAPI from '../../../../../hooks/useAPI'

const { Title } = Typography

const ContactInfoCard = ({ initialUserData }) => {
	const [isShowModal, setIsShowModal] = useState(false)

	const [form] = Form.useForm()
	const api = useAPI()

	const handleOpenModal = useCallback(() => {
		setIsShowModal(true)
		form.setFieldsValue(api.data.user || initialUserData)
	}, [api.data, initialUserData])

	const handleCloseModal = useCallback(() => {
		setIsShowModal(false)
		form.resetFields()
	}, [])

	return (
		<>
			<Card>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						مشخصات کاربر{' '}
					</Title>
					<Button type='default' color='primary' icon={<EditOutlined />} size='middle' onClick={handleOpenModal} disabled={api.isLoading}>
						ویرایش
					</Button>
				</Flex>

				<ContactInfoDisplay userData={api.data.user || initialUserData} />
			</Card>
			{isShowModal && <ContactInfoModal open={isShowModal} onClose={handleCloseModal} api={api} form={form} />}
		</>
	)
}

export default ContactInfoCard
