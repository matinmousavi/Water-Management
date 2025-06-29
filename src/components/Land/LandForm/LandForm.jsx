import { Form, Input, Select } from 'antd'
import { useUser } from '../../../contexts/UserContext'
import TextArea from 'antd/es/input/TextArea'

const irrigationOptions = [
	{ value: 'قطره‌ای', label: 'قطره‌ای' },
	{ value: 'بارانی', label: 'بارانی' },
	{ value: 'سطحی', label: 'سطحی' },
	{ value: 'چاه دستی', label: 'چاه دستی' },
	{ value: 'سایر', label: 'سایر' },
]

const labelColSpan = 8
const wrapperColSpan = 20

const LandForm = ({ form, landOwners = [], wells = [] }) => {
	const { isAdmin } = useUser()
	console.log(landOwners)

	return (
		<Form form={form} name='landForm' labelCol={{ span: labelColSpan }} colon={false} wrapperCol={{ span: wrapperColSpan }} labelAlign='left'>
			<Form.Item name='title' label='عنوان زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>

			{isAdmin && (
				<Form.Item name='owner' label='مالک زمین' rules={[{ required: true, message: 'مالک را وارد کنید' }]}>
					<Select
						showSearch
						placeholder='انتخاب'
						allowClear
						style={{ width: '100%' }}
						filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
						options={landOwners.map(owner => ({
							value: owner._id,
							label: `${owner.firstName} ${owner.lastName}`,
						}))}
						fieldNames={{ value: 'value', label: 'label' }}
						size='large'
					/>
				</Form.Item>
			)}

			<Form.Item
				name='area'
				label='مساحت'
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

			<Form.Item name='cropType' label='محصول' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>

			<Form.Item name='irrigationType' label='نوع آبیاری' rules={[{ required: true, message: 'نوع آبیاری را انتخاب کنید ' }]}>
				<Select options={irrigationOptions} placeholder='انتخاب' allowClear size='large' />
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
			<Form.Item name='wellId' label='چاه'>
				<Select
					showSearch
					placeholder='انتخاب'
					allowClear
					style={{ width: '100%' }}
					filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
					options={wells.map(well => ({
						value: well._id,
						label: well.title,
					}))}
					fieldNames={{ value: 'value', label: 'label' }}
					size='large'
				/>
			</Form.Item>
			<Form.Item name='irrigator' label='میرآب' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Select
					showSearch
					placeholder='انتخاب'
					allowClear
					style={{ width: '100%' }}
					filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
					options={landOwners.map(owner => ({
						value: owner._id,
						label: `${owner.firstName} ${owner.lastName}`,
					}))}
					fieldNames={{ value: 'value', label: 'label' }}
					size='large'
				/>
			</Form.Item>
		</Form>
	)
}

export default LandForm
