import React, { useEffect } from 'react'
import { Modal, Form, Select, TimePicker, Row, Col, Button, Radio, Input } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const colorPalette = [
	'#e0f7e980',
	'#fff4e580',
	'#e6f7ff80',
	'#ffe6f080',
	'#f3e5f580',
	'#fff9c480',
	'#e0f7fa80',
	'#ffebee80',
	'#fff3e080',
	'#f3e5f580',
	'#ffe0b280',
	'#e1bee780',
	'#ffccbc80',
	'#cfd8dc80',
]

const OFF_HOURS_COLOR = '#00000033'

export default function ScheduleModal({ visible, onCancel, onOk, onDelete, isLoading, editingTask, form, selectOptions, scheduleType, setScheduleType }) {
	useEffect(() => {
		if (editingTask) {
			const type = editingTask.targetType === 'off' ? 'off' : 'land'
			setScheduleType(type)
			form.setFieldsValue({
				color: type === 'off' ? OFF_HOURS_COLOR : editingTask.color,
			})
		} else {
			setScheduleType('land')
			form.setFieldsValue({ color: colorPalette[0] })
		}
	}, [editingTask, form, setScheduleType])

	const handleScheduleTypeChange = e => {
		setScheduleType(e.target.value)
		form.setFieldsValue({
			target: undefined,
			color: e.target.value === 'off' ? OFF_HOURS_COLOR : colorPalette[0],
		})
	}

	return (
		<Modal
			title={editingTask ? 'ویرایش زمان‌بندی' : 'افزودن زمان‌بندی'}
			open={visible}
			onCancel={onCancel}
			destroyOnHidden
			footer={
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					{editingTask ? (
						<div
							style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}
							onClick={onDelete}
							role='button'
							tabIndex={0}
							onKeyDown={e => {
								if (e.key === 'Enter' || e.key === ' ') onDelete()
							}}
						>
							<DeleteOutlined />
							حذف زمان بندی
						</div>
					) : (
						<div />
					)}
					<div>
						<Button key='cancel' onClick={onCancel} style={{ marginLeft: 8 }}>
							لغو
						</Button>
						<Button key='submit' type='primary' loading={isLoading} onClick={onOk}>
							تایید
						</Button>
					</div>
				</div>
			}
		>
			<Form form={form} layout='horizontal' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false}>
				<Form.Item label='نوع برنامه' style={{ marginBottom: 24 }}>
					<Radio.Group value={scheduleType} onChange={handleScheduleTypeChange}>
						<Radio value='land'>زمین</Radio>
						<Radio value='off'>ساعت خاموشی</Radio>
					</Radio.Group>
				</Form.Item>

				{scheduleType === 'land' && (
					<Form.Item label='زمین' name='target' rules={[{ required: scheduleType === 'land', message: 'لطفا زمین را انتخاب کنید' }]}>
						<Select size='large' placeholder='انتخاب زمین' options={selectOptions} />
					</Form.Item>
				)}

				<Form.Item label={scheduleType === 'land' ? 'ساعت آبیاری' : 'ساعت خاموشی'} required>
					<Row gutter={16} align='middle'>
						<Col span={12}>
							<Form.Item name='startTime' noStyle rules={[{ required: true, message: 'ساعت شروع را انتخاب کنید' }]}>
								<TimePicker placeholder='شروع' format='HH:mm' size='large' style={{ width: '100%' }} showNow={false} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='endTime'
								noStyle
								dependencies={['startTime']}
								rules={[
									{ required: true, message: 'ساعت پایان را انتخاب کنید' },
									({ getFieldValue }) => ({
										validator(_, value) {
											const start = getFieldValue('startTime')
											if (!start || !value) return Promise.resolve()
											if (!dayjs(value).isAfter(dayjs(start))) return Promise.reject(new Error('زمان پایان باید بعد از زمان شروع باشد'))
											if (dayjs(value).diff(dayjs(start), 'minute') < 15)
												return Promise.reject(new Error('اختلاف زمان باید حداقل ۱۵ دقیقه باشد'))
											return Promise.resolve()
										},
									}),
								]}
							>
								<TimePicker placeholder='پایان' format='HH:mm' size='large' style={{ width: '100%' }} showNow={false} />
							</Form.Item>
						</Col>
					</Row>
				</Form.Item>

				<Form.Item label='رنگ'>
					{scheduleType === 'land' ? (
						<Form.Item name='color' noStyle rules={[{ required: scheduleType === 'land' }]}>
							<Select
								options={colorPalette.map(c => ({ value: c, label: <div style={{ background: c, height: 24, borderRadius: 4 }} /> }))}
								optionLabelProp='label'
							/>
						</Form.Item>
					) : (
						<div
							style={{
								background: OFF_HOURS_COLOR,
								height: 32,
								borderRadius: 6,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontWeight: 'bold',
							}}
						>
							<Form.Item name='color' initialValue={OFF_HOURS_COLOR} noStyle>
								<Input type='hidden' />
							</Form.Item>
						</div>
					)}
				</Form.Item>
			</Form>
		</Modal>
	)
}
