'use client'

import { Button, Col, Form, Input, Modal, Popconfirm, Row, Select, TimePicker, Spin } from 'antd'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { DeleteOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import styles from './IrrigationScheduleTable.module.css'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

dayjs.extend(isBetween)

const taskColors = {
	field: '#87ceeb',
	furnace: '#dda0dd',
	maintenance: '#f0e68c',
	off: '#d3d3d3',
}

const IrrigationScheduleTable = ({ wellId, selectedSnapshot }) => {
	const [tasks, setTasks] = useState([])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [editingTask, setEditingTask] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const [loadingTable, setLoadingTable] = useState(false)
	const [form] = Form.useForm()
	const api = useAPI()
	const { openNotification } = useNotification()

	const daysOfWeek = ['روز اول', 'روز دوم', 'روز سوم', 'روز چهارم', 'روز پنجم', 'روز ششم', 'روز هفتم']

	const generateTimeSlots = () => {
		const slots = []
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
				const persianHour = hour.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
				const persianMinute = minute
					.toString()
					.padStart(2, '0')
					.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
				slots.push({
					value: timeString,
					label: `${persianHour}:${persianMinute}`,
					hour,
					minute,
				})
			}
		}
		return slots
	}

	const timeSlots = generateTimeSlots()

	// ✅ Fetch schedules
	const fetchSchedules = async () => {
		setLoadingTable(true)
		try {
			const res = await api.get(`/wells/${wellId}/schedules`)
			setTasks(res.schedules || [])
		} catch {
			openNotification('error', 'خطا', 'خطا در دریافت زمان‌بندی‌ها')
		} finally {
			setLoadingTable(false)
		}
	}

	useEffect(() => {
		if (wellId) fetchSchedules()
	}, [wellId, selectedSnapshot])

	const handleTaskClick = task => {
		setEditingTask(task)
		form.setFieldsValue({
			title: task.title,
			startTime: dayjs(task.startTime),
			endTime: dayjs(task.endTime),
			day: task.day ?? 0,
			color: task.color || taskColors.field,
			type: task.targetType || 'land',
		})
		setIsModalVisible(true)
	}

	const handleEmptySlotClick = (day, timeSlot) => {
		setEditingTask(null)
		form.resetFields()
		form.setFieldsValue({
			type: 'land',
			color: taskColors.field,
			day,
			startTime: dayjs(timeSlot, 'HH:mm'),
			endTime: dayjs(timeSlot, 'HH:mm').add(15, 'minute'),
		})
		setIsModalVisible(true)
	}

	// ➕ Add or Edit
	const handleModalOk = async () => {
		try {
			const values = await form.validateFields()
			setIsLoading(true)

			const payload = {
				title: values.title,
				startTime: values.startTime.toISOString(),
				endTime: values.endTime.toISOString(),
				targetType: values.type,
			}

			if (editingTask?._id) {
				// ✏️ Update
				await api.patch(`/wells/${wellId}/schedules/${editingTask._id}`, payload)
				openNotification('success', 'زمان‌بندی بروزرسانی شد')
			} else {
				// ➕ Create
				await api.post(`/wells/${wellId}/schedules`, payload)
				openNotification('success', 'زمان‌بندی ایجاد شد')
			}

			setIsModalVisible(false)
			setEditingTask(null)
			await fetchSchedules()
		} catch {
			openNotification('error', 'خطا', 'خطا در ذخیره زمان‌بندی')
		} finally {
			setIsLoading(false)
		}
	}

	// ❌ Delete
	const handleDeleteTask = async () => {
		if (!editingTask?._id) return
		try {
			await api.delete(`/wells/${wellId}/schedules/${editingTask._id}`)
			openNotification('success', 'زمان‌بندی حذف شد')
			setIsModalVisible(false)
			setEditingTask(null)
			await fetchSchedules()
		} catch {
			openNotification('error', 'خطا', 'خطا در حذف زمان‌بندی')
		}
	}

	const getTaskPosition = task => {
		const startTime = dayjs(task.startTime)
		const endTime = dayjs(task.endTime)
		const startMinutes = startTime.hour() * 60 + startTime.minute()
		const endMinutes = endTime.hour() * 60 + endTime.minute()
		const startSlotIndex = timeSlots.findIndex(slot => slot.hour * 60 + slot.minute === startMinutes)

		const top = startSlotIndex * 15
		const height = ((endMinutes - startMinutes) / 15) * 15

		return { top, height }
	}

	const isTimeSlotOccupied = (day, timeSlot) =>
		tasks.some(task => {
			if (task.day !== day) return false
			const taskStart = dayjs(task.startTime)
			const taskEnd = dayjs(task.endTime)
			const slotTime = dayjs(timeSlot, 'HH:mm')
			return slotTime.isBetween(taskStart, taskEnd, null, '[)')
		})

	return (
		<>
			<Spin spinning={loadingTable}>
				<div className={styles['schedule-wrapper']}>
					<div className={styles['irrigation-schedule-container']}>
						<div className={styles['schedule-header']}>
							<div className={styles['time-header']}>ساعت</div>
							{daysOfWeek.map((day, index) => (
								<div key={index} className={styles['day-header-cell']}>
									{day}
								</div>
							))}
						</div>

						<div className={styles['schedule-grid']}>
							<div className={styles['time-column']}>
								<div className={styles['time-column-content']} style={{ height: `${timeSlots.length * 15}px` }}>
									{timeSlots.map((timeSlot, index) => {
										if (timeSlot.minute === 0) {
											const persianHour = timeSlot.hour.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
											return (
												<div
													key={index}
													className={`${styles['time-label-absolute']} ${index === 0 ? styles['first-label'] : ''}`}
													style={{ top: `${index * 15}px` }}
												>
													{persianHour}:۰۰
												</div>
											)
										}
										return null
									})}

									{timeSlots.map(
										(timeSlot, index) =>
											timeSlot.minute === 45 && (
												<div key={`hour-line-${index}`} className={styles['time-hour-bold']} style={{ top: `${(index + 1) * 15}px` }} />
											)
									)}
								</div>
							</div>

							{daysOfWeek.map((day, dayIndex) => (
								<div key={dayIndex} className={styles['day-column']}>
									<div className={styles['day-content']} style={{ height: `${timeSlots.length * 15}px` }}>
										{timeSlots.map((timeSlot, timeIndex) => (
											<div
												key={timeIndex}
												className={`${styles['grid-line']} ${timeIndex % 4 === 3 ? styles['hour-bold'] : ''}`}
												style={{
													top: timeIndex * 15,
													height: '15px',
													cursor: isTimeSlotOccupied(dayIndex, timeSlot.value) ? 'default' : 'pointer',
												}}
												onClick={() => {
													if (!isTimeSlotOccupied(dayIndex, timeSlot.value)) {
														handleEmptySlotClick(dayIndex, timeSlot.value)
													}
												}}
											/>
										))}

										{tasks
											.filter(task => task.day === dayIndex)
											.map(task => {
												const { top, height } = getTaskPosition(task)
												return (
													<div
														key={task._id}
														onClick={() => handleTaskClick(task)}
														className={styles['task-card']}
														style={{
															top: `${top}px`,
															height: `${height}px`,
															backgroundColor: task.color || taskColors.field,
														}}
													>
														<div className={styles['task-name']}>{task.title}</div>
														<div className={styles['task-time']}>
															{dayjs(task.startTime).format('HH:mm')} - {dayjs(task.endTime).format('HH:mm')}
														</div>
													</div>
												)
											})}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</Spin>

			<Modal
				title={editingTask ? 'ویرایش برنامه آبیاری' : 'افزودن برنامه آبیاری جدید'}
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => {
					setIsModalVisible(false)
					setEditingTask(null)
				}}
				okText='تایید'
				cancelText='لغو'
				confirmLoading={isLoading}
				footer={[
					<Button
						key='cancel'
						onClick={() => {
							setIsModalVisible(false)
							setEditingTask(null)
						}}
					>
						لغو
					</Button>,
					editingTask && (
						<Popconfirm
							key='delete'
							title='حذف برنامه'
							description='آیا مطمئن هستید که می‌خواهید این برنامه را حذف کنید؟'
							onConfirm={handleDeleteTask}
							okText='بله'
							cancelText='خیر'
						>
							<Button danger icon={<DeleteOutlined />}>
								حذف
							</Button>
						</Popconfirm>
					),
					<Button key='submit' type='primary' loading={isLoading} onClick={handleModalOk}>
						تایید
					</Button>,
				]}
			>
				<Form form={form} layout='horizontal' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false}>
					<Form.Item label='زمین' name='title' rules={[{ required: true, message: 'لطفا نام برنامه را وارد کنید' }]}>
						<Input size='large' placeholder='انتخاب' />
					</Form.Item>

					<Form.Item label='ساعت آبیاری' required>
						<Row gutter={16} align='middle'>
							<Col span={12}>
								<Form.Item name='startTime' noStyle rules={[{ required: true, message: 'ساعت شروع را انتخاب کنید' }]}>
									<TimePicker placeholder='شروع' format='HH:mm' size='large' style={{ width: '100%' }} minuteStep={15} showNow={false} />
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
												if (!start || !value || dayjs(value).isAfter(dayjs(start))) {
													return Promise.resolve()
												}
												return Promise.reject(new Error('زمان پایان باید بعد از زمان شروع باشد'))
											},
										}),
									]}
								>
									<TimePicker placeholder='پایان' format='HH:mm' size='large' style={{ width: '100%' }} minuteStep={15} showNow={false} />
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>

					<Form.Item label='رنگ' name='color' rules={[{ required: true, message: 'رنگ را انتخاب کنید' }]}>
						<Select size='large' placeholder='انتخاب رنگ' optionLabelProp='label' style={{ height: 40, padding: 0 }}>
							<Select.Option value='#87ceeb' label={<div style={{ background: '#87ceeb', width: '100%', height: 30 }} />}>
								<div style={{ background: '#87ceeb', width: '100%', height: 30 }} />
							</Select.Option>

							<Select.Option value='#dda0dd' label={<div style={{ background: '#dda0dd', width: '100%', height: 30 }} />}>
								<div style={{ background: '#dda0dd', width: '100%', height: 30 }} />
							</Select.Option>

							<Select.Option value='#90ee90' label={<div style={{ background: '#90ee90', width: '100%', height: 30 }} />}>
								<div style={{ background: '#90ee90', width: '100%', height: 30 }} />
							</Select.Option>

							<Select.Option value='#f08080' label={<div style={{ background: '#f08080', width: '100%', height: 30 }} />}>
								<div style={{ background: '#f08080', width: '100%', height: 30 }} />
							</Select.Option>

							<Select.Option value='#ffa500' label={<div style={{ background: '#ffa500', width: '100%', height: 30 }} />}>
								<div style={{ background: '#ffa500', width: '100%', height: 30 }} />
							</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}

export default IrrigationScheduleTable
