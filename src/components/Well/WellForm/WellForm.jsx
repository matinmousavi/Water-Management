import { Flex, Form, Input, Select, TimePicker } from 'antd'
import { useUser } from '../../../contexts/UserContext'
import FaDatePicker from '../../FaDatePicker/FaDatePicker'

const { TextArea } = Input

const WellForm = ({ form, irrigators = [] }) => {
	const { isAdmin } = useUser()

	return (
		<Form form={form} layout='horizontal' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false}>
			<Form.Item label='عنوان چاه' name='title' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input />
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
							label: `${irrigator.firstName} ${irrigator.lastName}`,
						}))}
						fieldNames={{ value: 'value', label: 'label' }}
						size='large'
					/>
				</Form.Item>
			)}

			<Form.Item label='License Code' name='licenseCode'>
				<Input />
			</Form.Item>

			<Form.Item label='مکان' name='location'>
				<TextArea rows={4} />
			</Form.Item>

			<Form.Item label='Cycle Days' name='cycleDays' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input type='number' />
			</Form.Item>

			<Form.Item label='تاریخ شروع سایکل' name='cycleDayDate' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<FaDatePicker placeholder='تاریخ' size='large' />
			</Form.Item>

			<Form.Item label='ساعت کار' required>
				<Flex>
					<Form.Item name='startTime' rules={[{ required: true, message: 'زمان شروع الزامی است' }]} style={{ flex: 1, marginBottom: 0 }}>
						<TimePicker placeholder='شروع' format='HH:mm' size='large' style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item name='endTime' rules={[{ required: true, message: 'زمان پایان الزامی است' }]} style={{ flex: 1, marginBottom: 0 }}>
						<TimePicker placeholder='پایان' format='HH:mm' size='large' style={{ width: '100%' }} />
					</Form.Item>
				</Flex>
			</Form.Item>
		</Form>
	)
}

export default WellForm
