import React, { useEffect } from 'react'
import { Modal, Form } from 'antd'
import { useParams } from 'react-router'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'

const UserModal = ({ children, type = 'add', isOpen, setIsOpen, initialData = null, setData, setPageTitle }) => {
	const [form] = Form.useForm()
	const { userId } = useParams()
	const userApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (isOpen && initialData) {
			form.setFieldsValue(initialData)
		}
	}, [isOpen, initialData, form])

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
			} else {
				const endpoint = userId ? `users/${userId}` : 'me'
				response = await userApi.patch(endpoint, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `کاربر با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد.`)

				if (typeof setData === 'function') {
					setData(response)
					form.resetFields()
				}

				if (type === 'edit' && typeof setPageTitle === 'function') {
					setPageTitle(`${response.user.firstName} ${response.user.lastName}`)
					form.setFieldsValue(response.user)
				}
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error?.error?.message || 'خطایی رخ داده است')
		}
	}

	const childWithProps = React.isValidElement(children) ? React.cloneElement(children, { form }) : children

	return (
		<Modal
			title={type === 'add' ? 'افزودن کاربر' : 'ویرایش کاربر'}
			centered
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ذخیره'
			cancelText='انصراف'
			confirmLoading={userApi.isLoading}
		>
			{childWithProps}
		</Modal>
	)
}

export default UserModal
