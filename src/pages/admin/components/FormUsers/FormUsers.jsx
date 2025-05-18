import { Button, Dropdown, Form, Input, Modal } from 'antd'
import useAPI from '../../../../hooks/useAPI'
import useNotification from '../../../../hooks/useNotification'

const ROLE_OPTIONS = [
	{ value: 'admin', label: 'مدیر' },
	{ value: 'irrigator', label: 'میراب' },
	{ value: 'landOwner', label: 'مالک زمین' },
]

const PHONE_REGEX = /^(۰|0)(۹|9)[0-9۰-۹]{9}$/

const UserFormModal = ({ visible, onClose, onSuccess }) => {
	const [form] = Form.useForm()
	const { openNotification } = useNotification()
	const { post: createUser } = useAPI('/users')

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			await createUser(values)

			openNotification('success', 'عملیات موفق', 'کاربر با موفقیت اضافه شد.')
			form.resetFields()
			onSuccess()
			onClose()
		} catch (error) {
			openNotification('error', 'خطا', error.response?.data?.message || 'خطایی در ارسال داده رخ داد')
		}
	}

	const getSelectedRoleLabel = () => {
		const selectedRole = form.getFieldValue('role')
		return ROLE_OPTIONS.find(role => role.value === selectedRole)?.label
	}

	return (
		<Modal title='فرم افزودن کاربر' visible={visible} onOk={handleSubmit} onCancel={onClose} okText='ذخیره' cancelText='انصراف' destroyOnClose>
			<Form form={form} layout='vertical' initialValues={{ role: 'landOwner' }}>
				<Form.Item name='firstName' label='نام' rules={[{ required: true, message: 'لطفاً نام را وارد کنید!' }]}>
					<Input placeholder='مثال: علی' />
				</Form.Item>

				<Form.Item name='lastName' label='نام خانوادگی' rules={[{ required: true, message: 'لطفاً نام خانوادگی را وارد کنید!' }]}>
					<Input placeholder='مثال: محمدی' />
				</Form.Item>

				<Form.Item name='email' label='ایمیل' rules={[{ type: 'email', message: 'ایمیل معتبر نیست!' }]}>
					<Input placeholder='example@domain.com' />
				</Form.Item>

				<Form.Item
					name='mobile'
					label='شماره موبایل'
					rules={[
						{ required: true, message: 'شماره موبایل خود را وارد کنید!' },
						{ pattern: PHONE_REGEX, message: 'شماره موبایل معتبر نیست!' },
					]}
				>
					<Input placeholder='مثال: 09121111111' type='tel' inputMode='numeric' maxLength={11} />
				</Form.Item>

				<Form.Item name='role' label='نقش کاربر' rules={[{ required: true, message: 'لطفاً نقش کاربر را انتخاب کنید' }]}>
					<Dropdown
						menu={{
							items: ROLE_OPTIONS,
							onClick: ({ key }) => form.setFieldsValue({ role: key }),
						}}
						trigger={['click']}
					>
						<Button>{getSelectedRoleLabel() || 'نقش کاربر را انتخاب کنید'}</Button>
					</Dropdown>
				</Form.Item>
			</Form>
		</Modal>
	)
}

export default UserFormModal
