import { useEffect } from 'react'
import { Form, Modal } from 'antd'
import UserForm from './UserForm'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'

const UserModal = ({ type = 'add', userData = null, setUsersData, isOpen, setIsOpen }) => {
	const [form] = Form.useForm()
	const userApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (type === 'edit' && userData) {
			form.setFieldsValue(userData)
		}
	}, [userData, type, form])

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()

			let response
			if (type === 'add') {
				response = await userApi.post('users', values)
			} else if (type === 'edit' && userData?._id) {
				response = await userApi.put(`users/${userData._id}`, values)
			}

			if (response.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `کاربر با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد.`)
				if (setUsersData) {
					setUsersData(prev => {
						if (type === 'add') {
							return [...prev, response.user]
						}
						return prev.map(user => (user._id === response.user._id ? response.user : user))
					})
				}

				form.resetFields()
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error?.error?.message || 'خطایی رخ داد')
		}
	}

	return (
		<Modal
			title={type === 'add' ? 'فرم افزودن کاربر' : 'فرم ویرایش کاربر'}
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ذخیره'
			cancelText='انصراف'
		>
			<UserForm form={form} />
		</Modal>
	)
}

export default UserModal
