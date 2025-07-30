import { Flex, Form, Input, Select, TimePicker } from 'antd'
import { useUser } from '../../../contexts/UserContext'
import FaDatePicker from '../../FaDatePicker/FaDatePicker'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'

const { TextArea } = Input

const numberOnlyProps = {
	inputMode: 'numeric',
	pattern: '[0-9]*',
	onKeyPress: e => {
		if (!/[0-9]/.test(e.key)) {
			e.preventDefault()
		}
	},
}

const WellForm = ({ form, irrigators = [] }) => {
	const { isAdmin } = useUser()
	const [startTime, setStartTime] = useState(null)

	useEffect(() => {
		setStartTime(form.getFieldValue('startTime'))
	}, [form])

	const disabledHours = () => {
		if (!startTime) return []
		const startHour = dayjs(startTime).hour()
		// غیرفعال کردن تمام ساعت‌های قبل از ساعت شروع
		return Array.from({ length: startHour }, (_, i) => i)
	}

	const disabledMinutes = selectedHour => {
		if (!startTime) return []
		const startHour = dayjs(startTime).hour()
		const startMinute = dayjs(startTime).minute()
		// فقط دقیقه‌های قبل یا مساوی دقیقه شروع برای همان ساعت غیرفعال می‌شوند
		if (selectedHour !== startHour) return []
		return Array.from({ length: startMinute + 1 }, (_, i) => i)
	}

	return (
		<Form form={form} layout='horizontal' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false}>
			<Form.Item label='عنوان چاه' name='title' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input size='large' />
			</Form.Item>

			{isAdmin && (
				<Form.Item label='نام میرآب' name='irrigator'>
					<Select
						showSearch
						placeholder='انتخاب'
						allowClear
						filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
						options={irrigators?.map(irrigator => ({
							value: irrigator._id,
							label: irrigator.fullName,
						}))}
						fieldNames={{ value: 'value', label: 'label' }}
						size='large'
					/>
				</Form.Item>
			)}

			<Form.Item label='License Code' name='licenseCode'>
				<Input size='large' {...numberOnlyProps} />
			</Form.Item>

			<Form.Item label='مکان' name='location'>
				<TextArea rows={4} />
			</Form.Item>

			<Form.Item label='Cycle Days' name='cycleDays' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<Input size='large' {...numberOnlyProps} />
			</Form.Item>

			<Form.Item label='تاریخ شروع سایکل' name='cycleStartDate' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
				<FaDatePicker placeholder='تاریخ' size='large' />
			</Form.Item>

			<Form.Item label='ساعت خاموشی' required>
				<Flex>
					<Form.Item name='startTime' rules={[{ required: true, message: 'زمان شروع الزامی است' }]} style={{ flex: 1, marginBottom: 0 }}>
						<TimePicker placeholder='شروع' format='HH:mm' size='large' style={{ width: '100%' }} onChange={value => setStartTime(value)} />
					</Form.Item>

					<Form.Item
						name='endTime'
						dependencies={['startTime']}
						rules={[
							{ required: true, message: 'زمان پایان الزامی است' },
							({ getFieldValue }) => ({
								validator(_, value) {
									const start = getFieldValue('startTime')
									if (!start || !value || dayjs(value).isAfter(dayjs(start))) {
										return Promise.resolve()
									}
									return Promise.reject(new Error('زمان پایان باید بعد از زمان شروع باشد'))
								},
							}),
						]}
						style={{ flex: 1, marginBottom: 0 }}
					>
						<TimePicker
							placeholder='پایان'
							format='HH:mm'
							size='large'
							style={{ width: '100%' }}
							disabledHours={disabledHours}
							disabledMinutes={disabledMinutes}
						/>
					</Form.Item>
				</Flex>
			</Form.Item>
		</Form>
	)
}

export default WellForm
