import { Form, Input, Row, Col } from 'antd'
import SelectIrrigator from '../../SelectIrrigator/SelectIrrigator'

const WellForm = ({ form }) => {
	return (
		<Form form={form} layout='vertical'>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item name='licenseCode' label='کد پروانه' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name='title' label='عنوان' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name='irrigator' label='نام میراب' rules={[{ message: 'این فیلد الزامی است' }]}>
						<SelectIrrigator />
					</Form.Item>
				</Col>
				<Col span={24}>
					<Form.Item name='cycleDays' label='تعداد روزهای چرخه' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Input type='number' />
					</Form.Item>
				</Col>
			</Row>
		</Form>
	)
}

export default WellForm
