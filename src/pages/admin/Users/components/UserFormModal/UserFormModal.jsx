import { useState, useEffect } from 'react'
import { Button, Form, Modal, Radio } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import FormFields from '../../../../../components/FormFields/FormFields'

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]

const UserFormModal = ({ type = 'add', userData = null, setUsersData }) => {
	const [isOpen, setIsOpen] = useState(false)
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
				response = await userApi.post('/users', values)
			} else if (type === 'edit' && userData?.id) {
				response = await userApi.put(`/users/${userData.id}`, values)
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

	const contactFormFields = [
		{
			name: 'firstName',
			label: 'نام',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'lastName',
			label: 'نام خانوادگی',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'role',
			label: 'نقش',
			col: 24,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
			customComponent: (
				<Radio.Group>
					{ROLES.map(role => (
						<Radio key={role.key} value={role.key}>
							{role.label}
						</Radio>
					))}
				</Radio.Group>
			),
		},
		{
			name: 'email',
			label: 'ایمیل',
			rules: [
				{
					pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
					message: 'فرمت ایمیل معتبر نیست',
				},
			],
		},
		{
			name: 'mobile',
			label: 'موبایل',
			rules: [
				{ required: true, message: 'شماره موبایل الزامی است' },
				{
					pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
					message: 'شماره موبایل معتبر نیست!',
				},
			],
			maxLength: 11,
			type: 'tel',
			inputMode: 'numeric',
		},
	]

	return (
		<>
			<Button type={type === 'add' ? 'primary' : 'default'} onClick={() => setIsOpen(true)}>
				{type === 'add' ? 'افزودن کاربر' : 'ویرایش'}
			</Button>

			<Modal
				title={type === 'add' ? 'فرم افزودن کاربر' : 'فرم ویرایش کاربر'}
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				okText='ذخیره'
				cancelText='انصراف'
			>
				<Form form={form} layout='vertical'>
					<FormFields fields={contactFormFields} />
				</Form>
			</Modal>
		</>
	)
}

export default UserFormModal
