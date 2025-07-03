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
					placeholder='انتخاب'
					optionFilterProp='children'
					filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
					allowClear
					size='large'
				>
					{lands?.map(land => (
						<Select.Option key={land._id} value={land._id}>
							{land.title}
						</Select.Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item label='شروع آب‌رسانی' required>
				<Row gutter={16} align='middle' justify='start'>
					<Col span={13}>
						<Form.Item name='startDate' noStyle rules={[{ required: true, message: 'تاریخ شروع الزامی است' }]}>
							<FaDatePicker placeholder='تاریخ' size='large' />
						</Form.Item>
					</Col>
					<Col span={11}>
						<Form.Item name='startTime' noStyle rules={[{ required: true, message: 'زمان شروع الزامی است' }]}>
							<TimePicker placeholder='ساعت' format='HH:mm' size='large' />
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			<Form.Item label='پایان آب‌رسانی'>
				<Row gutter={16} align='middle' justify='start'>
					<Col span={13}>
						<Form.Item name='endDate' noStyle>
							<FaDatePicker placeholder='تاریخ' disabled={isOngoing} size='large' />
						</Form.Item>
					</Col>
					<Col span={11}>
						<Form.Item name='endTime' noStyle>
							<TimePicker placeholder='ساعت' format='HH:mm' disabled={isOngoing} size='large' />
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			<Form.Item name='isOngoing' valuePropName='checked' wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
				<Checkbox>در حال آب‌رسانی</Checkbox>
			</Form.Item>

			<Form.Item name='note' label='توضیحات'>
				<Input.TextArea rows={3} />
			</Form.Item>
		</Form>
	)
}

export default AdminWellLogForm
