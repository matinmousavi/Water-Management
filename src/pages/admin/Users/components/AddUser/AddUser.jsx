import React, { useCallback } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import UserForm from '../../../../../components/User/UserForm/UserForm'

const AddUser = ({ setUser }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const userApi = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		form.resetFields()
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()
			console.log('Form Values:', values)
			const response = await userApi.post('users', values)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'کاربر با موفقیت افزوده شد.')
				setUser(prev => ({
					...prev,
					users: [...(prev?.users || []), response.user],
				}))
				close(() => form.resetFields(), 'after')
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}, [form, userApi, close, setUser, openNotification])

	return (
		<>
			<Button type='primary' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={5} align='center' justify='center'>
					<PlusOutlined />
					<span>افزودن کاربر</span>
				</Flex>
			</Button>

			<Modal
				title='افزودن کاربر'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				confirmLoading={userApi.isLoading}
				okText='ثبت'
				cancelText='انصراف'
				forceRender
				centered
			>
				<UserForm form={form} />
			</Modal>
		</>
	)
}

export default AddUser
