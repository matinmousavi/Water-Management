import { Modal, Form } from 'antd'
import ContactInfoForm from '../ContactInfoForm/ContactInfoForm'
import useAPI from '../../../../../../../hooks/useAPI'
import { useUser } from '../../../../../../../contexts/UserContext'
import { useParams } from 'react-router'

const ContactInfoModal = ({ open, onClose, form }) => {
	const api = useAPI()
	const { setUser } = useUser()
	const { userId } = useParams()

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			const endpoint = userId ? `users/${userId}` : 'me'
			const res = await api.patch(endpoint, values)

			if (!res?.error) {
				userId ? api.setData(res.user) : setUser(res.user)
				onClose()
			}
		} catch (err) {
			console.error('Error saving contact info:', err)
		}
	}

	return (
		<Modal
			title='ویرایش اطلاعات'
			centered
			open={open}
			onCancel={onClose}
			onOk={handleSubmit}
			okText='ذخیره'
			cancelText='انصراف'
			confirmLoading={api.isLoading}
		>
			<ContactInfoForm form={form} />
		</Modal>
	)
}

export default ContactInfoModal
