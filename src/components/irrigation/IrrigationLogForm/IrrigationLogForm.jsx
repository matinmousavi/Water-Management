import { Form, Select, Input, Row, Col, TimePicker, Checkbox, Tag, Grid } from 'antd'
import FaDatePicker from '../../common/FaDatePicker/FaDatePicker'
import dayjs from 'dayjs'

const { Option } = Select

const IrrigationLogForm = ({ form, lands = [], landGroups = [], mode, type = 'admin', page = 'well', defaultWell, allWells = [] }) => {
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs
	const labelCol = { span: 8 }
	const wrapperCol = { span: 16 }

	const isOngoing = Form.useWatch('isOngoing', form)
	const startDate = Form.useWatch('startDate', form)
	const startTime = Form.useWatch('startTime', form)
	const endDate = Form.useWatch('endDate', form)
	const changeWell = Form.useWatch('changeWell', form)

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

	const activeLands = lands.filter(land => land.status === 'active')
	const landsInGroups = landGroups.flatMap(group => group.lands)
	const landsNotInGroups = activeLands.filter(land => !landsInGroups.includes(land._id))

	return (
		<Form form={form} layout='horizontal' labelAlign='left' labelCol={labelCol} wrapperCol={wrapperCol}>
			{page === 'well' && (
				<Form.Item name='landId' label='زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
					<Select
						showSearch
						placeholder='انتخاب'
						optionFilterProp='children'
						filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
						allowClear
						disabled={mode === 'edit'}
						size={isMobile ? 'middle' : 'large'}
					>
						{landsNotInGroups.map(land => (
							<Option key={land._id} value={land._id}>
								{land.title} - {land.owner?.fullName}
							</Option>
						))}
						{landGroups.map(group => (
							<Option key={`group-${group.groupId}`} value={`group-${group.groupId}`}>
								{group.title}{' '}
								<Tag color='blue' style={{ marginRight: 8, fontSize: 12, padding: '0 6px' }}>
									گروه
								</Tag>
							</Option>
						))}
					</Select>
				</Form.Item>
			)}

			{page === 'land' && (
				<Form.Item label='نام چاه'>
					<Row gutter={8}>
						<Col span={24}>
							{changeWell ? (
								<Form.Item name='wellId' noStyle rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
									<Select
										showSearch
										placeholder='انتخاب چاه'
										filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
										options={allWells.map(well => ({ value: well._id, label: well.title }))}
										size={isMobile ? 'middle' : 'large'}
									/>
								</Form.Item>
							) : (
								<>
									<Input value={defaultWell?.title} disabled size={isMobile ? 'middle' : 'large'} />
									{/* This hidden item just keeps the defaultWell._id in the form state */}
									<Form.Item name='wellId' noStyle>
										<Input type='hidden' />
									</Form.Item>
								</>
							)}
						</Col>
						<Col span={24} style={{ marginTop: '8px' }}>
							<Form.Item name='changeWell' valuePropName='checked' noStyle>
								<Checkbox>تغییر چاه</Checkbox>
							</Form.Item>
						</Col>
					</Row>
				</Form.Item>
			)}

			<Form.Item label='شروع آب‌رسانی' required>
				<Row gutter={16} align='middle'>
					<Col span={13}>
						<Form.Item name='startDate' noStyle rules={[{ required: true, message: 'تاریخ شروع الزامی است' }]}>
							<FaDatePicker placeholder='تاریخ' size={isMobile ? 'middle' : 'large'} disabled={type === 'irrigator' && mode === 'edit'} />
						</Form.Item>
					</Col>
					<Col span={11}>
						<Form.Item name='startTime' noStyle rules={[{ required: true, message: 'ساعت شروع الزامی است' }]}>
							<TimePicker
								placeholder='ساعت'
								format='HH:mm'
								size={isMobile ? 'middle' : 'large'}
								disabled={type === 'irrigator' && mode === 'edit'}
							/>
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
								size={isMobile ? 'middle' : 'large'}
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
								size={isMobile ? 'middle' : 'large'}
								disabled={isOngoing || (type === 'irrigator' && mode !== 'edit')}
								disabledTime={disabledEndTime}
								hideDisabledOptions
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form.Item>

			{type === 'admin' && (
				<Form.Item name='isOngoing' valuePropName='checked' wrapperCol={!isMobile ? { offset: labelCol.span, span: 16 } : { span: 24 }}>
					<Checkbox>در حال آب‌رسانی</Checkbox>
				</Form.Item>
			)}

			<Form.Item name='note' label='توضیحات'>
				<Input.TextArea rows={3} />
			</Form.Item>
		</Form>
	)
}

export default IrrigationLogForm
