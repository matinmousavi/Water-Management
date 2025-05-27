import { Form, Input, Select, Row, Col } from 'antd'
import SelectOwner from './SelectOwner'

const irrigationOptions = [
	{ value: 'قطره‌ای', label: 'قطره‌ای' },
	{ value: 'بارانی', label: 'بارانی' },
	{ value: 'سطحی', label: 'سطحی' },
	{ value: 'چاه دستی', label: 'چاه دستی' },
	{ value: 'سایر', label: 'سایر' },
]

const LandForm = ({ form }) => (
	<Form form={form} layout='vertical'>
		<Row gutter={16}>
			<Col span={12}>
				<Form.Item name='name' label='نام' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
					<Input />
				</Form.Item>
			</Col>

			<Col span={12}>
				<Form.Item name='owner' label='مالک' rules={[{ required: true, message: 'مالک را وارد کنید' }]}>
					<SelectOwner />
				</Form.Item>
			</Col>

			<Col span={12}>
				<Form.Item
					name='area'
					label='مساحت (هکتار)'
					rules={[
						{ required: true, message: 'این فیلد الزامی است' },
						{ pattern: /^[0-9]+$/, message: 'فرمت معتبر نیست' },
					]}
				>
					<Input />
				</Form.Item>
			</Col>

			<Col span={12}>
				<Form.Item
					name='kFactor'
					label='K-Factor'
					rules={[
						{ required: true, message: 'این فیلد الزامی است' },
						{ pattern: /^[0-9.]+$/, message: 'فرمت معتبر نیست' },
					]}
				>
					<Input />
				</Form.Item>
			</Col>

			<Col span={24}>
				<Form.Item
					name='location'
					label='موقعیت'
					rules={[
						{ required: true, message: 'این فیلد الزامی است' },
						{ pattern: /^.+$/, message: 'فرمت معتبر نیست' },
					]}
				>
					<Input />
				</Form.Item>
			</Col>

			<Col span={24}>
				<Form.Item name='irrigationType' label='نوع آبیاری' rules={[{ required: true, message: 'لطفاً نوع آبیاری را انتخاب کنید' }]}>
					<Select options={irrigationOptions} placeholder='انتخاب نوع آبیاری' allowClear />
				</Form.Item>
			</Col>
		</Row>
	</Form>
)

export default LandForm
