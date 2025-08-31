import { Form, Row, Col, TimePicker, Input, Checkbox } from 'antd'
import dayjs from 'dayjs'
import FaDatePicker from '../../../../../../../../../components/FaDatePicker/FaDatePicker'

const GroupFormLogs = ({ form, type = 'admin', mode = 'add' }) => {
	const labelCol = { span: 8 }
	const wrapperCol = { span: 18 }

	const isOngoing = Form.useWatch('isOngoing', form)
	const startDate = Form.useWatch('startDate', form)
	const startTime = Form.useWatch('startTime', form)
	const endDate = Form.useWatch('endDate', form)

	const disabledEndTime = () => {
		if (!startDate || !startTime || !endDate) return {}
		const sameDay = dayjs(startDate).isSame(dayjs(endDate), 'day')
		if (!sameDay) return {}
		const startHour = dayjs(startTime).hour()
		const startMinute = dayjs(startTime).minute()
		return {
			disabledHours: () => Array.from({ length: startHour }, (_, i) => i),
			disabledMinutes: selectedHour => (selectedHour === startHour ? Array.from({ length: startMinute }, (_, i) => i) : []),
		}
	}

	return (
		<Form form={form} layout='horizontal' labelAlign='left' labelCol={labelCol} wrapperCol={wrapperCol}>
			{/* شروع آب‌رسانی: در add فعال، در edit فقط نمایش (disabled) */}
			<Form.Item label='شروع آب‌رسانی' required={mode === 'add'}>
				<Row gutter={16} align='middle'>
					<Col span={13}>
						<Form.Item name='startDate' noStyle rules={mode === 'add' ? [{ required: true, message: 'تاریخ شروع الزامی است' }] : []}>
							<FaDatePicker placeholder='تاریخ' size='large' disabled={mode === 'edit' || isOngoing} />
						</Form.Item>
					</Col>
					<Col span={11}>
						<Form.Item name='startTime' noStyle rules={mode === 'add' ? [{ required: true, message: 'ساعت شروع الزامی است' }] : []}>
							<TimePicker placeholder='ساعت' format='HH:mm' size='large' disabled={mode === 'edit' || isOngoing} />
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			{/* پایان آب‌رسانی: همیشه نمایش؛ در add غیرفعال، در edit فعال. هرگز required نیست */}
			<Form.Item label='پایان آب‌رسانی'>
				<Row gutter={16} align='middle'>
					<Col span={13}>
						<Form.Item name='endDate' noStyle>
							<FaDatePicker
								placeholder='تاریخ'
								size='large'
								disabled={mode === 'add' || isOngoing}
								disabledDate={current => startDate && current && current.isBefore(dayjs(startDate), 'day')}
							/>
						</Form.Item>
					</Col>
					<Col span={11}>
						<Form.Item name='endTime' noStyle>
							<TimePicker
								placeholder='ساعت'
								format='HH:mm'
								size='large'
								disabled={mode === 'add' || isOngoing}
								disabledTime={disabledEndTime}
								hideDisabledOptions
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			{/* فقط ادمین در حالت افزودن می‌تونه ongoing بزنه */}
			{type === 'admin' && mode === 'add' && (
				<Form.Item name='isOngoing' valuePropName='checked' wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
					<Checkbox
						onChange={e => {
							if (e.target.checked) {
								form.setFieldsValue({
									startDate: dayjs(),
									startTime: dayjs(),
								})
							} else {
								form.resetFields(['startDate', 'startTime'])
							}
						}}
					>
						در حال آب‌رسانی
					</Checkbox>
				</Form.Item>
			)}

			<Form.Item name='note' label='توضیحات'>
				<Input.TextArea rows={3} />
			</Form.Item>
		</Form>
	)
}

export default GroupFormLogs
