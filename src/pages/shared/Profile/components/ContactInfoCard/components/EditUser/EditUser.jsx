import { useCallback, useState } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../hooks/useModal'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'
import UserForm from '../../../../../../../components/User/UserForm/UserForm'
import { useParams } from 'react-router'

const EditUser = ({ initialValue, setData, setPageTitle }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const [imageFile, setImageFile] = useState(null)
	const [initialImage, setInitialImage] = useState(initialValue?.profilePicture || null)
	const userApi = useAPI()
	const { openNotification } = useNotification()
	const { userId } = useParams()

	const handleOpen = () => {
		form.setFieldsValue(initialValue)
		setInitialImage(initialValue?.profilePicture || null)
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
			if (!userId) {
				openNotification('error', 'خطا', 'شناسه کاربر موجود نیست')
				return
			}

			const formData = new FormData()

			Object.entries(values).forEach(([key, value]) => {
				if (value !== undefined && value !== null && key !== 'image') {
					formData.append(key, value)
				}
			})

			if (imageFile && imageFile != 'delete') {
				if (!initialImage || typeof initialImage !== 'object' || imageFile.name !== initialImage.name || imageFile.size !== initialImage.size) {
					formData.append('image', imageFile)
				}
			} else if (imageFile === 'delete') {
				formData.append('profilePicture', null)
			}

			const response = await userApi.patch(`users/${userId}`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'کاربر با موفقیت ویرایش شد.')

				if (typeof setData === 'function') {
					setData(({ user }) => {
						const { firstName: _, lastName: __, ...newRest } = response.user
						const { firstName: ___, lastName: ____, ...prevRest } = user || {}

						const hasOtherChanges = Object.keys(newRest).some(key => newRest[key] !== prevRest[key])

						return hasOtherChanges ? { user: response.user } : user
					})
				}

				if (typeof setPageTitle === 'function') {
					const newTitle = `${response.user.firstName} ${response.user.lastName}`
					setPageTitle(prevTitle => (newTitle !== prevTitle ? newTitle : prevTitle))
				}

				close(() => {
					form.resetFields()
					setImageFile(null)
				}, 'after')
			}
		} catch (err) {
			console.error('Submission error:', err)
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}, [form, userApi, close, initialValue, setData, setPageTitle, openNotification, imageFile, initialImage, userId])

	return (
		<>
			<Button className='style-btn' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={5} align='center' justify='center'>
					<EditOutlined />
					<span>ویرایش</span>
				</Flex>
			</Button>

			<Modal
				title='ویرایش کاربر'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				confirmLoading={userApi.isLoading}
				okText='ثبت'
				cancelText='انصراف'
			>
				<UserForm form={form} setImageFile={setImageFile} initialImage={initialImage} />
			</Modal>
		</>
	)
}

export default EditUser
