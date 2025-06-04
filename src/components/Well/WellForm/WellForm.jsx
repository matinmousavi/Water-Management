import { Form, Input } from 'antd'
import SelectIrrigator from '../../SelectIrrigator/SelectIrrigator'
import { useUser } from '../../../contexts/UserContext'

const labelColSpan = 8
const wrapperColSpan = 20

const WellForm = ({ form }) => {
	const { isAdmin } = useUser()

	return (
		<Form form={form} layout='horizontal' labelCol={{ span: labelColSpan }} wrapperCol={{ span: wrapperColSpan }} labelAlign='left'>
			<Form.Item label='عنوان چاه' name='title' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
			</Form.Item>

			{isAdmin && (
				<Form.Item label='نام میراب' name='irrigator'>
					<SelectIrrigator />
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
