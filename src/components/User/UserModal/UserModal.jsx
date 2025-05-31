import { Modal } from 'antd'
import { useParams } from 'react-router'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import { useUser } from '../../../contexts/UserContext'
import UserForm from '../UserForm/UserForm'

const UserModal = ({ type = 'add', open, onClose, api, form }) => {
	const { userId } = useParams()
	const { setUser } = useUser()
	const userApi = useAPI()
	const { openNotification } = useNotification()

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()

			let response
			if (type === 'add') {
				response = await userApi.post('users', values)
			} else {
				const endpoint = userId ? `users/${userId}` : 'me'
				response = await userApi.patch(endpoint, values)
			}

			if (!response?.error) {
				openNotification('success', 'عملیات موفق', `کاربر با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد.`)
				if (type === 'add') {
					api.setData(prev => ({
						...prev,
						users: [...(prev?.users || []), response.user],
					}))
				} else {
					userId ? api.setData(response) : setUser(response)
				}

				form.resetFields()
				onClose()
			} else {
				openNotification('error', 'خطا', response.message)
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داد')
		}
	}

	return (
		<Modal
			title={type === 'add' ? 'افزودن کاربر' : 'ویرایش کاربر'}
			centered
			open={open}
			onCancel={onClose}
			onOk={handleSubmit}
			okText='ذخیره'
			cancelText='انصراف'
			confirmLoading={userApi.isLoading}
		>
			<UserForm form={form} />
		</Modal>
	)
}

export default UserModal
