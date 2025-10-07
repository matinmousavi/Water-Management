import { Form, Grid, Input, Select } from 'antd'
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
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs
	return (
		<Form form={form} name='landForm' labelCol={{ span: labelColSpan }} colon={false} wrapperCol={{ span: wrapperColSpan }} labelAlign='left'>
			<Form.Item name='title' label='عنوان زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input size={isMobile ? 'middle' : 'large'} />
			</Form.Item>

			{isAdmin && (
				<Form.Item name='owner' label='نام مالک' rules={[{ required: true, message: 'مالک را وارد کنید' }]}>
					<Select
						showSearch
						placeholder='انتخاب'
						allowClear
						style={{ width: '100%' }}
						filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
						options={landOwners.map(owner => ({
							value: owner._id,
							label: `${owner.fullName}`,
						}))}
						fieldNames={{ value: 'value', label: 'label' }}
						size={isMobile ? 'middle' : 'large'}
					/>
				</Form.Item>
			)}

			<Form.Item name='area' label='مساحت'>
				<Input
					size={isMobile ? 'middle' : 'large'}
					inputMode='numeric'
					pattern='[0-9]*'
					onKeyPress={e => {
						if (!/[0-9]/.test(e.key)) {
							e.preventDefault()
						}
					}}
				/>
			</Form.Item>

			<Form.Item name='kFactor' label='K-factor'>
				<Input size={isMobile ? 'middle' : 'large'} />
			</Form.Item>

			<Form.Item name='cropType' label='محصول'>
				<Input size={isMobile ? 'middle' : 'large'} />
			</Form.Item>

			<Form.Item name='irrigationType' label='نوع آبیاری'>
				<Select options={irrigationOptions} placeholder='انتخاب' allowClear size={isMobile ? 'middle' : 'large'} />
			</Form.Item>

			<Form.Item name='location' label='مکان'>
				<TextArea />
			</Form.Item>
			<Form.Item name='wellId' label='عنوان چاه'>
				<Select
					showSearch1
					placeholder='انتخاب'
					allowClear
					style={{ width: '100%' }}
					filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
					options={wells.map(well => ({
						value: well._id,
						label: well.title,
					}))}
					fieldNames={{ value: 'value', label: 'label' }}
					size={isMobile ? 'middle' : 'large'}
				/>
			</Form.Item>
		</Form>
	)
}

export default LandForm
