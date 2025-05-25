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
			{fields.map(({ name, label, rules, col = 24, inputType = 'input', options = [], customComponent, ...restProps }) => {
				if (customComponent) {
					return (
						<Col key={name} span={col}>
							<Form.Item name={name} label={label} rules={rules}>
								{customComponent}
							</Form.Item>
						</Col>
					)
				}

				const Component = componentMap[inputType] || Input

				return (
					<Col key={name} span={col}>
						<Form.Item name={name} label={label} rules={rules}>
							{inputType === 'select' ? (
								<Select {...restProps}>
									{options.map(opt => (
										<Select.Option key={opt.value} value={opt.value}>
											{opt.label}
										</Select.Option>
									))}
								</Select>
							) : (
								<Component {...restProps} />
							)}
						</Form.Item>
					</Col>
				)
			})}
		</Row>
	)
}

export default FormFields
