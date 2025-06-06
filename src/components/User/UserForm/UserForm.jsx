import { Form, Input, Radio } from 'antd'

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]

const labelColSpan = 6
const wrapperColSpan = 18

const UserForm = ({ form }) => {
	return (
		<Form form={form} layout='horizontal' labelCol={{ span: labelColSpan }} wrapperCol={{ span: wrapperColSpan }} labelAlign='left'>
			<Form.Item label='نام' name='firstName' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>

			<Form.Item label='نام خانوادگی' name='lastName' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>

			<Form.Item label='نقش' name='role' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Radio.Group>
					{ROLES.map(role => (
						<Radio key={role.key} value={role.key}>
							{role.label}
						</Radio>
					))}
				</Radio.Group>
			</Form.Item>

			<Form.Item
				label='شماره همراه'
				name='mobile'
				rules={[
					{ required: true, message: 'شماره موبایل الزامی است' },
					{
						pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
						message: 'شماره موبایل معتبر نیست!',
					},
				]}
			>
				<Input maxLength={11} inputMode='numeric' />
			</Form.Item>

			<Form.Item
				label='ایمیل'
				name='email'
				rules={[
					{
						pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
						message: 'فرمت ایمیل معتبر نیست',
					},
				]}
			>
				<Input />
			</Form.Item>

			<Form.Item label='کد حسابداری' name='accountingCode'>
				<Input />
			</Form.Item>

			<Form.Item label='آدرس' name='address'>
				<Input.TextArea rows={1} />
			</Form.Item>
		</Form>
	)
}

export default UserForm
