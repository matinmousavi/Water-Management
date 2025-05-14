const FormUsers = ({ isOpen, setIsOpen }) => {
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			await userApi.post('/users', {
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				mobile: values.mobile,
				role: 'admin',
			})
			form.resetFields()
			setIsOpen(false)
			await fetchData()
		} catch (error) {
			console.error(error)
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
