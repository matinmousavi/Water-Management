import { Form, Input, Select } from 'antd'
import { useUser } from '../../../contexts/UserContext'
import styles from './WellForm.module.css'

const { TextArea } = Input

const WellForm = ({ form, irrigators = [] }) => {
	const { isAdmin } = useUser()

	return (
		<Form form={form} layout='vertical'>
			<Form.Item label='عنوان چاه' name='title' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>

			{isAdmin && (
				<Form.Item label=' نام میرآب ' name='irrigator'>
					<Select
						showSearch
						placeholder='انتخاب'
						allowClear
						style={{ width: '100%' }}
						filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
						options={irrigators?.map(irrigator => ({
							value: irrigator._id,
							label: `${irrigator.firstName} ${irrigator.lastName}`,
						}))}
						fieldNames={{ value: 'value', label: 'label' }}
						size='large'
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
				<TextArea rows={3} />
			</Form.Item>
		</Form>
	)
}

export default WellForm
