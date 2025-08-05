'use client'

import { Button, Col, Form, Modal, Popconfirm, Row, Select, TimePicker, Spin } from 'antd'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { DeleteOutlined } from '@ant-design/icons'
import { useState, useEffect, useMemo } from 'react'
import styles from './IrrigationScheduleTable.module.css'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

dayjs.extend(isBetween)

const colorPalette = [
	'#e0f7e9',
	'#fff4e5',
	'#e6f7ff',
	'#ffe6f0',
	'#f3e5f5',
	'#fff9c4',
	'#e0f7fa',
	'#ffebee',
	'#fff3e0',
	'#f3e5f5',
	'#ffe0b2',
	'#e1bee7',
	'#ffccbc',
	'#cfd8dc',
]

function numberToPersianOrdinal(n) {
	const ordinals = {
		1: 'اول',
		2: 'دوم',
		3: 'سوم',
		4: 'چهارم',
		5: 'پنجم',
		6: 'ششم',
		7: 'هفتم',
		8: 'هشتم',
		9: 'نهم',
		10: 'دهم',
		11: 'یازدهم',
		12: 'دوازدهم',
		13: 'سیزدهم',
		14: 'چهاردهم',
		15: 'پانزدهم',
		16: 'شانزدهم',
		17: 'هفدهم',
		18: 'هجدهم',
		19: 'نوزدهم',
		20: 'بیستم',
		21: 'بیست و یکم',
		22: 'بیست و دوم',
		23: 'بیست و سوم',
		24: 'بیست و چهارم',
		25: 'بیست و پنجم',
		26: 'بیست و ششم',
		27: 'بیست و هفتم',
		28: 'بیست و هشتم',
		29: 'بیست و نهم',
		30: 'سی‌ام',
	}
	return ordinals[n] || n
}

const IrrigationScheduleTable = ({ wellId, selectedSnapshot, lands = [], landGroups = [], cycleDays = 0 }) => {
	const [tasks, setTasks] = useState([])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [editingTask, setEditingTask] = useState(null)
	const [selectedDay, setSelectedDay] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const [loadingTable, setLoadingTable] = useState(false)
	const [form] = Form.useForm()
	const api = useAPI()
	const { openNotification } = useNotification()

	const daysOfWeek = Array.from({ length: cycleDays }, (_, i) => `روز ${numberToPersianOrdinal(i + 1)}`)

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

	const landOptions = useMemo(() => {
		const landsInGroups = landGroups.flatMap(g => g.lands)
		return lands.filter(l => !landsInGroups.includes(l._id)).map(l => ({ value: l._id, label: l.title }))
	}, [lands, landGroups])

	const groupOptions = useMemo(() => landGroups.map(g => ({ value: g.groupId, label: `${g.title} (گروه)` })), [landGroups])

	const selectOptions = useMemo(() => {
		if (landOptions.length === 0) return groupOptions
		if (groupOptions.length === 0) return landOptions
		return [
			{ label: 'زمین‌ها', options: landOptions },
			{ label: 'گروه‌ها', options: groupOptions },
		]
	}, [landOptions, groupOptions])

	const handleTaskClick = task => {
		setEditingTask(task)
		setSelectedDay(task.day)

		let targetValue = null
		if (task.targetType === 'land' && task.land) {
			targetValue = task.land._id
		} else if (task.targetType === 'group' && task.landGroup) {
			targetValue = task.landGroup._id
		}

		form.setFieldsValue({
			target: targetValue,
			startTime: dayjs(task.startTime),
			endTime: dayjs(task.endTime),
			day: task.day ?? 0,
			color: task.color || colorPalette[0],
		})
		setIsModalVisible(true)
	}

	const handleEmptySlotClick = (day, timeSlot) => {
		setEditingTask(null)
		setSelectedDay(day)
		form.resetFields()
		form.setFieldsValue({
			color: colorPalette[0],
			day,
			startTime: dayjs(timeSlot, 'HH:mm'),
			endTime: dayjs(timeSlot, 'HH:mm').add(15, 'minute'),
		})
		setIsModalVisible(true)
	}

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields()
			setIsLoading(true)

			const isGroup = groupOptions.some(g => g.value === values.target)

			const payload = {
				startTime: values.startTime.toISOString(),
				endTime: values.endTime.toISOString(),
				targetType: isGroup ? 'group' : 'land',
				targetId: values.target,
				color: values.color,
				day: selectedDay,
			}

			if (editingTask?._id) {
				await api.patch(`/wells/${wellId}/schedules/${editingTask._id}`, payload)
				openNotification('success', 'زمان‌بندی بروزرسانی شد')
			} else {
				await api.post(`/wells/${wellId}/schedules`, payload)
				openNotification('success', 'زمان‌بندی ایجاد شد')
			}

			setIsModalVisible(false)
			setEditingTask(null)
			setSelectedDay(null)
			await fetchSchedules()
		} catch {
			openNotification('error', 'خطا', 'خطا در ذخیره زمان‌بندی')
		} finally {
			setIsLoading(false)
		}
	}

	const handleDeleteTask = async () => {
		if (!editingTask?._id) return
		try {
			await api.delete(`/wells/${wellId}/schedules/${editingTask._id}`)
			openNotification('success', 'زمان‌بندی حذف شد')
			setIsModalVisible(false)
			setEditingTask(null)
			setSelectedDay(null)
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

		return { top: startSlotIndex * 15, height: ((endMinutes - startMinutes) / 15) * 15 }
	}

	const isTimeSlotOccupied = (day, timeSlot) =>
		tasks.some(task => {
			if (task.day !== day) return false
			const slotTime = dayjs(timeSlot, 'HH:mm')
			return slotTime.isBetween(dayjs(task.startTime), dayjs(task.endTime), null, '[)')
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
															backgroundColor: task.color || colorPalette[0],
														}}
													>
														<div className={styles['task-name']}>{task.title}</div>
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
				onCancel={() => {
					setIsModalVisible(false)
					setEditingTask(null)
					setSelectedDay(null)
				}}
				footer={
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						{editingTask ? (
							<div
								style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}
								onClick={handleDeleteTask}
								role='button'
								tabIndex={0}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') handleDeleteTask()
								}}
							>
								<DeleteOutlined />
								حذف زمان بندی
							</div>
						) : (
							<div />
						)}
						<div>
							<Button key='cancel' onClick={() => setIsModalVisible(false)} style={{ marginLeft: 8 }}>
								لغو
							</Button>
							<Button key='submit' type='primary' loading={isLoading} onClick={handleModalOk}>
								تایید
							</Button>
						</div>
					</div>
				}
			>
				<Form form={form} layout='horizontal' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false}>
					<Form.Item label='زمین یا گروه' name='target' rules={[{ required: true, message: 'لطفا انتخاب کنید' }]}>
						<Select size='large' placeholder='انتخاب' options={selectOptions} />
					</Form.Item>

					<Form.Item label='ساعت آبیاری' required>
						<Row gutter={16} align='middle'>
							<Col span={12}>
								<Form.Item name='startTime' noStyle rules={[{ required: true, message: 'ساعت شروع را انتخاب کنید' }]}>
									<TimePicker
										placeholder='شروع'
										format='HH:mm'
										size='large'
										style={{ width: '100%' }}
										showNow={false}
										// حذف minuteStep تا هر دقیقه قابل انتخاب باشه
									/>
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

												if (!dayjs(value).isAfter(dayjs(start))) {
													return Promise.reject(new Error('زمان پایان باید بعد از زمان شروع باشد'))
												}

												const diffMinutes = dayjs(value).diff(dayjs(start), 'minute')
												if (diffMinutes < 15) {
													return Promise.reject(new Error('اختلاف زمان باید حداقل ۱۵ دقیقه باشد'))
												}

												return Promise.resolve()
											},
										}),
									]}
								>
									<TimePicker
										placeholder='پایان'
										format='HH:mm'
										size='large'
										style={{ width: '100%' }}
										showNow={false}
										// حذف minuteStep تا هر دقیقه قابل انتخاب باشه
									/>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>

					<Form.Item name='color' label='رنگ' rules={[{ required: true }]}>
						<Select
							options={colorPalette.map(c => ({
								value: c,
								label: <div style={{ background: c, height: 24, borderRadius: 4 }} />,
							}))}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}

export default IrrigationScheduleTable
