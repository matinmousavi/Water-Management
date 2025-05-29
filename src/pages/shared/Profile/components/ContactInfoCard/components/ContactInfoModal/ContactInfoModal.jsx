import { Modal } from 'antd'
import ContactInfoForm from '../ContactInfoForm/ContactInfoForm'
import useAPI from '../../../../../../../hooks/useAPI'
import { useUser } from '../../../../../../../contexts/UserContext'
import { useParams } from 'react-router'

const ContactInfoModal = ({ open, onClose, api, form }) => {
	const { setUser } = useUser()
	const { userId } = useParams()
	const patchApi = useAPI()

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			const endpoint = userId ? `users/${userId}` : 'me'
			const response = await patchApi.patch(endpoint, values)

			if (!response?.error) {
				userId ? api.setData(response) : setUser(response)
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
			confirmLoading={patchApi.isLoading}
		>
			<ContactInfoForm form={form} />
		</Modal>
	)
}

export default ContactInfoModal
