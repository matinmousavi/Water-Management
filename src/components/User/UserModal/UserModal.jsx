import { Form, Modal } from 'antd'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import { useUser } from '../../../contexts/UserContext'
import UserForm from '../UserForm/UserForm'

const UserModal = ({ type = 'add', isOpen, setIsOpen, initialUserData, api }) => {
	const [form] = Form.useForm()
	const { userId } = useParams()
	const { setUser } = useUser()
	const userApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (isOpen) {
			const userData = api.data?.user || initialUserData
			if (userData) {
				form.setFieldsValue(userData)
			}
		}
	}, [isOpen, api.data?.user, initialUserData, form])

	const handleClose = () => {
		form.resetFields()
		setIsOpen(false)
	}

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

				handleClose()
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
			open={isOpen}
			onCancel={handleClose}
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
