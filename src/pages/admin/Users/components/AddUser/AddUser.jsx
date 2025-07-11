import { useCallback, useState } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import UserForm from '../../../../../components/User/UserForm/UserForm'

const AddUser = ({ setUser }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const [imageFile, setImageFile] = useState(null)
	const userApi = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		form.resetFields()
		setImageFile(null)
	}

	const handleCancel = () => {
		close(() => {
			form.resetFields()
			setImageFile(null)
		}, 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()
			const formData = new FormData()

			Object.entries(values).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					formData.append(key, value)
				}
			})

			if (imageFile) {
				formData.append('image', imageFile)
			}

			const response = await userApi.post('users', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'کاربر با موفقیت افزوده شد.')
				setUser(prev => ({
					...prev,
					users: [...(prev?.users || []), response.user],
				}))
				handleCancel()
			}
		} catch (err) {
			console.error('Submission error:', err)
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}, [form, imageFile, userApi, openNotification, setUser])

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
				destroyOnHidden
			>
				<UserForm form={form} setImageFile={setImageFile} />
			</Modal>
		</>
	)
}

export default AddUser
