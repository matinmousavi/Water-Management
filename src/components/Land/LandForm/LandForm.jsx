import { Form, Input, Select, Row, Col } from 'antd'
import SelectOwner from '../../SelectOwner/SelectOwner'
import TextArea from 'antd/es/input/TextArea'
import SelectWell from '../../SelectWell/SelectWell'
import SelectIrrigator from '../../SelectIrrigator/SelectIrrigator'

const irrigationOptions = [
	{ value: 'قطره‌ای', label: 'قطره‌ای' },
	{ value: 'بارانی', label: 'بارانی' },
	{ value: 'سطحی', label: 'سطحی' },
	{ value: 'چاه دستی', label: 'چاه دستی' },
	{ value: 'سایر', label: 'سایر' },
]

const labelColSpan = 8
const wrapperColSpan = 20
const LandForm = ({ form , dataSelects }) => {
		console.log(dataSelects);

	
	return(
	
	<Form form={form} layout='horizontal' name='landForm' labelCol={{ span: labelColSpan }} wrapperCol={{ span: wrapperColSpan }} labelAlign='left'>
		<Form.Item name='name' label='عنوان زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
			<Input />
		</Form.Item>
		<Form.Item name='owner' label='نام مالک' rules={[{ required: true, message: 'مالک را وارد کنید' }]}>
			<SelectOwner />
		</Form.Item>

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
		<Form.Item name='product' label='محصول'>
			<Input />
		</Form.Item>
		<Form.Item name='irrigationType' label='نوع آبیاری' rules={[{ required: true, message: 'لطفاً نوع آبیاری را انتخاب کنید' }]}>
			<Select options={irrigationOptions} placeholder='انتخاب نوع آبیاری' allowClear />
		</Form.Item>
		<Form.Item
			name='location'
			label='مکان'
			rules={[
				{ required: true, message: 'این فیلد الزامی است' },
				{ pattern: /^.+$/, message: 'فرمت معتبر نیست' },
			]}
		>
			<TextArea />
		</Form.Item>
		<Form.Item name='title' label='عنوان چاه'>
			<Select/>
		</Form.Item>
		<Form.Item name='irrigation' label='نام میراب'>
			<SelectIrrigator />
		</Form.Item>
	</Form>
)}

export default LandForm
