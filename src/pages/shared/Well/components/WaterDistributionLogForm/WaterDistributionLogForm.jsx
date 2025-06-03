import { Col, Form, Input, Radio, Row, Select } from 'antd'
const WaterDistributionLogForm = ({ form, lands }) => {
	return (
		<Form form={form} layout='horizontal'>
			<Row gutter={16}>
				<Col span={24}>
					<Form.Item name='lands' label='زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Select placeholder='انتخاب زمین'>
							{lands.map(land => (
								<Select.Option key={land._id} value={land._id}>
									{land.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Col>
				<Col span={24}>
					<Form.Item name='time' label='نوع عملیات' rules={[{ required: true, message: 'نوع عملیات الزامی است' }]}>
						<Radio.Group>
							<Radio value='startTime'>شروع آبرسانی</Radio>
							<Radio value='endTime'>پایان آبرسانی</Radio>
						</Radio.Group>
					</Form.Item>
				</Col>
				<Col span={24}>
					<Form.Item name='notes' label='توضیحات'>
						<Input.TextArea rows={4} />
					</Form.Item>
				</Col>
			</Row>
		</Form>
	)
}

export default WaterDistributionLogForm
