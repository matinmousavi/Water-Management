import { Form, Row, Col, TimePicker, Input, Checkbox } from 'antd'
import dayjs from 'dayjs'
import FaDatePicker from '../../../../../../../../../components/FaDatePicker/FaDatePicker'

const GroupFormLogs = ({ form, type = 'admin', mode }) => {
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
			<Form.Item label='شروع آب‌رسانی' required>
				<Row gutter={16} align='middle'>
					<Col span={13}>
						<Form.Item name='startDate' noStyle rules={[{ required: true, message: 'تاریخ شروع الزامی است' }]}>
							<FaDatePicker placeholder='تاریخ' size='large' disabled={type === 'irrigator' && mode === 'edit'} />
						</Form.Item>
					</Col>
					<Col span={11}>
						<Form.Item name='startTime' noStyle rules={[{ required: true, message: 'ساعت شروع الزامی است' }]}>
							<TimePicker placeholder='ساعت' format='HH:mm' size='large' disabled={type === 'irrigator' && mode === 'edit'} />
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			<Form.Item label='پایان آب‌رسانی'>
				<Row gutter={16} align='middle'>
					<Col span={13}>
						<Form.Item name='endDate' noStyle>
							<FaDatePicker
								placeholder='تاریخ'
								size='large'
								disabled={isOngoing || (type === 'irrigator' && mode !== 'edit')}
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
								disabled={isOngoing || (type === 'irrigator' && mode !== 'edit')}
								disabledTime={disabledEndTime}
								hideDisabledOptions
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			{type === 'admin' && (
				<Form.Item name='isOngoing' valuePropName='checked' wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
					<Checkbox>در حال آب‌رسانی</Checkbox>
				</Form.Item>
			)}

			<Form.Item name='note' label='توضیحات'>
				<Input.TextArea rows={3} />
			</Form.Item>
		</Form>
	)
}

export default GroupFormLogs
