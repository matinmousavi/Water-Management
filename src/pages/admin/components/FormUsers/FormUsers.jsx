import { Form, Input, Modal } from 'antd'
import useAPI from '../../../../hooks/useAPI'
import useNotification from '../../../../hooks/useNotification'

const FormUsers = ({ isOpen, setIsOpen, setIsRenderList }) => {
	const { openNotification } = useNotification()
	const [form] = Form.useForm()
	const userApi = useAPI()
	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			await form.validateFields()
			const values = form.getFieldsValue()

			await userApi.post('/users', {
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				mobile: values.mobile,
				role: 'landOwner',
			})

			openNotification('success', 'عملیات موفق', 'کاربر با موفقیت اضافه شد.')
			form.resetFields()
			setIsRenderList(prev => !prev)
			handleCancel()
		} catch (error) {
			openNotification('error', 'خطا', userApi.error.error?.message)
		}
	}
	return (
		<Modal title='فرم افزودن کاربر' closable={{ 'aria-label': 'Custom Close Button' }} open={isOpen} onOk={handleSubmit} onCancel={() => setIsOpen(false)}>
			<Form form={form} layout='vertical'>
				<Form.Item name='firstName' label='نام' rules={[{ required: true, message: 'لطفاً نام را وارد کنید!' }]}>
					<Input placeholder='مثال: علی' />
				</Form.Item>
				<Form.Item name='lastName' label=' نام خانوادگی' rules={[{ required: true, message: 'لطفاً نام را وارد کنید!' }]}>
					<Input placeholder='مثال: محمدی' />
				</Form.Item>
				<Form.Item
					name='email'
					label='ایمیل'
					rules={[
						{ required: true, message: 'لطفاً ایمیل را وارد کنید!' },
						{ type: 'email', message: 'ایمیل معتبر نیست!' },
					]}
				>
					<Input placeholder='example@domain.com' />
				</Form.Item>

				<Form.Item
					label='شماره موبایل'
					name='mobile'
					rules={[
						{ message: 'شماره موبایل خود را وارد کنید!' },
						{
							pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
							message: 'شماره موبایل معتبر نیست!',
						},
					]}
				>
					<Input placeholder='مثال: 09121111111' type='tel' inputMode='numeric' maxLength={11} />
				</Form.Item>
			</Form>
		</Modal>
	)
}
export default FormUsers
