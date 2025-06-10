import { Form, Select, Checkbox, Input, Row, Col, TimePicker } from 'antd'
import { useEffect } from 'react'
import FaDatePicker from '../../../../../../../components/FaDatePicker/FaDatePicker'

const AdminWellLogForm = ({ form, lands }) => {
	const labelCol = { span: 8 }
	const wrapperCol = { span: 18 }
	const isOngoing = Form.useWatch('isOngoing', form)

	useEffect(() => {
		if (isOngoing) {
			form.setFieldsValue({ endDate: null, endTime: null })
		}
	}, [isOngoing, form])

	return (
		<Form form={form} layout='horizontal' labelAlign='left' labelCol={labelCol} wrapperCol={wrapperCol}>
			<Form.Item name='landId' label='زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Select
					showSearch
					placeholder='انتخاب زمین'
					optionFilterProp='children'
					filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
					allowClear
				>
					{lands?.map(l => (
						<Select.Option key={l._id} value={l._id}>
							{l.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item label='تاریخ شروع'>
				<Row gutter={16} align='middle' justify='start'>
					<Col span={13}>
						<Form.Item name='startDate' noStyle rules={[{ required: true, message: 'تاریخ شروع الزامی است' }]}>
							<FaDatePicker style={{ width: '100%' }} />
						</Form.Item>
					</Col>
					<Col span={11}>
						<Form.Item name='startTime' noStyle rules={[{ required: true, message: 'زمان شروع الزامی است' }]}>
							<TimePicker style={{ width: '100%' }} format='HH:mm' />
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			<Form.Item label='تاریخ پایان'>
				<Row gutter={16} align='middle' justify='start'>
					<Col span={13}>
						<Form.Item name='endDate' noStyle>
							<FaDatePicker style={{ width: '100%' }} disabled={isOngoing} />
						</Form.Item>
					</Col>
					<Col span={11}>
						<Form.Item name='endTime' noStyle>
							<TimePicker style={{ width: '100%' }} format='HH:mm' disabled={isOngoing} />
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			<Form.Item name='isOngoing' valuePropName='checked' wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
				<Checkbox>در حال آبیاری</Checkbox>
			</Form.Item>

			<Form.Item name='startNotes' label='توضیحات شروع'>
				<Input.TextArea rows={3} />
			</Form.Item>

			<Form.Item name='endNotes' label='توضیحات پایان'>
				<Input.TextArea rows={3} />
			</Form.Item>
		</Form>
	)
}

export default AdminWellLogForm
