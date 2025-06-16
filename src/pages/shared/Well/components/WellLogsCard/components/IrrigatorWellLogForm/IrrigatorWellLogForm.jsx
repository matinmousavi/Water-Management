import { Form, Select, Checkbox, Input } from 'antd'

const IrrigatorWellLogForm = ({ form, lands, type = 'add' }) => {
	const labelCol = { span: 8 }
	const wrapperCol = { span: 18 }

	return (
		<Form form={form} layout='horizontal' labelAlign='left' labelCol={labelCol} wrapperCol={wrapperCol}>
			<Form.Item name='landId' label='زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Select
					showSearch
					placeholder='انتخاب زمین'
					optionFilterProp='children'
					filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
					allowClear
					disabled={type === 'edit'}
				>
					{lands?.map(land => (
						<Select.Option key={land._id} value={land._id}>
							{land.title}
						</Select.Option>
					))}
				</Select>
			</Form.Item>

			{type === 'add' && (
				<Form.Item name='isStart' valuePropName='checked' wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
					<Checkbox>شروع آبرسانی</Checkbox>
				</Form.Item>
			)}

			{type === 'edit' && (
				<>
					<Form.Item name='isStart' valuePropName='checked' wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
						<Checkbox disabled>شروع آبرسانی</Checkbox>
					</Form.Item>

					<Form.Item name='isEnd' valuePropName='checked' wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
						<Checkbox>پایان آبرسانی</Checkbox>
					</Form.Item>
				</>
			)}

			<Form.Item name='startNotes' label='توضیحات شروع' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input.TextArea rows={3} />
			</Form.Item>

			{type === 'edit' && (
				<Form.Item name='endNotes' label='توضیحات پایان' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
					<Input.TextArea rows={3} />
				</Form.Item>
			)}
		</Form>
	)
}

export default IrrigatorWellLogForm
