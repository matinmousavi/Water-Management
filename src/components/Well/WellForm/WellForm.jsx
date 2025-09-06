import { Form, Grid, Input, Select } from 'antd'
import { useUser } from '../../../contexts/UserContext'
import FaDatePicker from '../../FaDatePicker/FaDatePicker'

const { TextArea } = Input

const numberOnlyProps = {
	inputMode: 'numeric',
	pattern: '[0-9]*',
	onKeyPress: e => {
		if (!/[0-9]/.test(e.key)) {
			e.preventDefault()
		}
	},
}

const WellForm = ({ form, irrigators = [] }) => {
	const { isAdmin } = useUser()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	return (
		<Form form={form} layout='horizontal' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false}>
			<Form.Item label='عنوان چاه' name='title' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input size='large' />
			</Form.Item>

			{isAdmin && (
				<Form.Item label='نام میرآب' name='irrigator'>
					<Select
						showSearch
						placeholder='انتخاب'
						allowClear
						filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
						options={irrigators?.map(irrigator => ({
							value: irrigator._id,
							label: irrigator.fullName,
						}))}
						fieldNames={{ value: 'value', label: 'label' }}
						size={isMobile ? 'middle' : 'large'}
					/>
				</Form.Item>
			)}

			<Form.Item label='License Code' name='licenseCode'>
				<Input size={isMobile ? 'middle' : 'large'} {...numberOnlyProps} />
			</Form.Item>

			<Form.Item label='مکان' name='location'>
				<TextArea rows={4} />
			</Form.Item>

			<Form.Item label='دوره' name='cycleDays' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input size={isMobile ? 'middle' : 'large'} {...numberOnlyProps} />
			</Form.Item>

			<Form.Item label='تاریخ شروع دوره' name='cycleStartDate' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<FaDatePicker placeholder='تاریخ' size={isMobile ? 'middle' : 'large'} />
			</Form.Item>
		</Form>
	)
}

export default WellForm
