import { Row, Col, Form, Input, Select } from 'antd'

const { TextArea } = Input

const componentMap = {
	input: Input,
	textarea: TextArea,
	select: Select,
}

const FormFields = ({ fields }) => {
	return (
		<Row gutter={[16, 16]}>
			{fields.map(({ name, label, rules, col = 24, type = 'input', options = [] }) => {
				const Component = componentMap[type] || Input
				const additionalProps =
					name === 'mobile'
						? {
								maxLength: 11,
								type: 'tel',
								inputMode: 'numeric',
						  }
						: {}

				return (
					<Col key={name} span={col}>
						<Form.Item name={name} label={label} rules={rules}>
							{type === 'select' ? (
								<Select>
									{options.map(opt => (
										<Select.Option key={opt.value} value={opt.value}>
											{opt.label}
										</Select.Option>
									))}
								</Select>
							) : (
								<Component {...additionalProps} />
							)}
						</Form.Item>
					</Col>
				)
			})}
		</Row>
	)
}

export default FormFields
