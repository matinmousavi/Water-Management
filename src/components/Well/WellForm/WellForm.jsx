import { Form, Input, Select } from 'antd'
import { useUser } from '../../../contexts/UserContext'

const WellForm = ({ form, irrigators = [] }) => {
	const { isAdmin } = useUser()

	return (
		<Form form={form} layout='vertical'>
			<Form.Item label='عنوان چاه' name='title' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>

			{isAdmin && (
				<Form.Item label='میراب' name='irrigator'>
					<Select
						showSearch
						placeholder='میراب را انتخاب کنید'
						allowClear
						style={{ width: '100%' }}
						filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
						options={irrigators?.map(irrigator => ({
							value: irrigator._id,
							label: `${irrigator.firstName} ${irrigator.lastName}`,
						}))}
						fieldNames={{ value: 'value', label: 'label' }}
					/>
				</Form.Item>
			)}

			<Form.Item label='لایسنس کد' name='licenseCode' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>

			<Form.Item label='روزهای چرخه' name='cycleDays' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input type='number' />
			</Form.Item>

			<Form.Item label='مکان' name='location' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>
		</Form>
	)
}

export default WellForm
