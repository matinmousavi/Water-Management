import { Checkbox, Col, Form, Input, Row } from 'antd'
import SelectLands from '../SelectLands/SelectLands'

const options = [
	{ label: 'شروع آبرسانی', value: 'start' },
	{ label: 'پایان آبرسانی', value: 'end' },
]
const WaterDistributionLogForm = ({ form, lands }) => {
	const changeCheckbox = checkedValues => {
		console.log('checked = ', checkedValues)
	}

	return (
		<Form form={form} layout='horizontal'>
			<Row gutter={16}>
				<Col span={24}>
					<Form.Item name='lands' label='زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<SelectLands defaultValues={lands?.map(item => item.name) || []} />
					</Form.Item>
				</Col>
        <Col span={24}>
					<Form.Item name='time' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Checkbox.Group options={options} onChange={changeCheckbox} />
					</Form.Item>
        </Col>
        <Col span={24}>
						<Form.Item name='description' label='توضیحات'>
							<Input.TextArea rows={4} />
					</Form.Item>
        </Col>
			</Row>
		</Form>
	)
}

export default WaterDistributionLogForm
