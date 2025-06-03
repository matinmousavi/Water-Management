import { Form, Input, Radio, Row, Col } from 'antd'

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]

const UserForm = ({ form }) => {
	return (
		<Form form={form} layout='vertical'>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item name='firstName' label='نام' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name='lastName' label='نام خانوادگی' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={24}>
					<Form.Item name='role' label='نقش' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Radio.Group>
							{ROLES.map(role => (
								<Radio key={role.key} value={role.key}>
									{role.label}
								</Radio>
							))}
						</Radio.Group>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						name='email'
						label='ایمیل'
						rules={[
							{
								pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
								message: 'فرمت ایمیل معتبر نیست',
							},
						]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						name='mobile'
						label='شماره موبایل'
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
				</Col>

				<Col span={12}>
					<Form.Item name='accountingCode' label='کد حسابداری' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Input />
					</Form.Item>
				</Col>

				<Col span={12}>
					<Form.Item name='address' label='آدرس' rules={[{ required: true, message: 'آدرس الزامی است' }]}>
						<Input.TextArea rows={1} />
					</Form.Item>
				</Col>
			</Row>
		</Form>
	)
}

export default UserForm
