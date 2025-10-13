import { useState, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { Form } from 'antd'
import useAPI from '../../../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../../../hooks/useNotification'
import { useWell } from '../../../../../../contexts/WellContext'
import ScheduleGrid from './components/ScheduleGrid'
import ScheduleModal from './components/ScheduleModal'
import { useUser } from '../../../../../../../../../contexts/UserContext'

dayjs.extend(isBetween)

const numberToPersianOrdinal = n => {
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

const OFF_HOURS_COLOR = '#00000033'

const ScheduleView = ({ wellId, selectedSnapshot, lands = [], landGroups = [], editable = true, cycleDays, cycleStartDate }) => {
	const [tasks, setTasks] = useState([])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [editingTask, setEditingTask] = useState(null)
	const [selectedDay, setSelectedDay] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const [form] = Form.useForm()
	const api = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()
	const [scheduleType, setScheduleType] = useState('land')

	const daysOfWeek = useMemo(() => Array.from({ length: cycleDays }, (_, i) => `روز ${numberToPersianOrdinal(i + 1)}`), [cycleDays])

	const generateTimeSlots = () => {
		const slots = []
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
				slots.push({ value: timeString, hour, minute })
			}
		}
		return slots
	}
	const timeSlots = useMemo(() => generateTimeSlots(), [])

	const fetchSchedules = async () => {
		try {
			const res = await api.get(`/wells/${wellId}/schedules`)
			setTasks(res.schedules || [])
		} catch {
			openNotification('error', 'خطا', 'خطا در دریافت زمان‌بندی‌ها')
		}
	}

	useEffect(() => {
		if (wellId) fetchSchedules()
	}, [wellId, selectedSnapshot, editable])

	const currentDayInCycle = useMemo(() => {
		if (!cycleStartDate) return -1
		const today = dayjs()
		const startDate = dayjs(cycleStartDate)
		const dayDifference = today.diff(startDate, 'day')
		if (dayDifference < 0) return -1
		return (dayDifference % cycleDays) + 1
	}, [cycleStartDate, cycleDays])

	const landOptions = useMemo(() => {
		const landsInGroups = landGroups.flatMap(g => g.lands)
		return lands
			.filter(l => !landsInGroups.includes(l._id))
			.map(l => ({
				value: l._id,
				label: `${l.title}${l.owner?.fullName ? ` - ${l.owner.fullName}` : ''}`,
			}))
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

	const resetModal = () => {
		setEditingTask(null)
		setSelectedDay(null)
		form.resetFields()
		form.setFieldsValue({ color: '#e0f7e980' })
		setScheduleType('land')
		setIsModalVisible(false)
	}

	const handleTaskClick = editable
		? task => {
				setEditingTask(task)
				setSelectedDay(task.day)
				let targetValue = undefined
				if (task.type === 'land') targetValue = task.landId
				else if (task.type === 'group') {
					const matchingGroup = landGroups.find(g => g._id === task.groupId || g.title === task.title)
					if (matchingGroup) targetValue = matchingGroup.groupId
				}
				form.setFieldsValue({
					target: targetValue,
					startTime: dayjs(task.startTime),
					endTime: dayjs(task.endTime),
					day: task.day ?? 0,
					color: task.color || '#e0f7e980',
				})
				setScheduleType(task.type === 'off' ? 'off' : 'land')
				setIsModalVisible(true)
		  }
		: undefined

	const handleEmptySlotClick = editable
		? (day, timeSlot) => {
				setEditingTask(null)
				setSelectedDay(day)
				form.resetFields()
				form.setFieldsValue({
					color: '#e0f7e980',
					day,
					startTime: dayjs(timeSlot, 'HH:mm'),
					endTime: dayjs(timeSlot, 'HH:mm').add(15, 'minute'),
				})
				setScheduleType('land')
				setIsModalVisible(true)
		  }
		: undefined

	const handleModalOk = editable
		? async () => {
				try {
					const values = await form.validateFields()
					setIsLoading(true)
					let payload
					if (values.color === OFF_HOURS_COLOR) {
						payload = {
							startTime: values.startTime.toISOString(),
							endTime: values.endTime.toISOString(),
							targetType: 'off',
							color: OFF_HOURS_COLOR,
							status: 'inactive',
							day: selectedDay,
						}
					} else {
						const isGroup = groupOptions.some(g => g.value === values.target)
						payload = {
							startTime: values.startTime.toISOString(),
							endTime: values.endTime.toISOString(),
							targetType: isGroup ? 'group' : 'land',
							targetId: values.target,
							color: values.color,
							status: 'active',
							day: selectedDay,
						}
					}
					if (editingTask?.id) await api.patch(`/wells/${wellId}/schedules/${editingTask.id}`, payload)
					else await api.post(`/wells/${wellId}/schedules`, payload)
					openNotification('success', 'زمان‌بندی ذخیره شد')
					resetModal()
					await fetchSchedules()
				} catch (err) {
					openNotification('error', `${err.error?.message || 'خطا'}`)
				} finally {
					setIsLoading(false)
				}
		  }
		: undefined

	const handleDeleteTask = editable
		? async () => {
				if (!editingTask?.id) return
				try {
					await api.delete(`/wells/${wellId}/schedules/${editingTask.id}`)
					openNotification('success', 'زمان‌بندی حذف شد')
					resetModal()
					await fetchSchedules()
				} catch {
					openNotification('error', 'خطا', 'خطا در حذف زمان‌بندی')
				}
		  }
		: undefined

	const getTaskPosition = task => {
		const slotHeight = 15
		const startTime = dayjs(task.startTime)
		const endTime = dayjs(task.endTime)
		const startMinutes = startTime.hour() * 60 + startTime.minute()
		const endMinutes = endTime.hour() * 60 + endTime.minute()
		const top = (startMinutes / 15) * slotHeight
		const height = ((endMinutes - startMinutes) / 15) * slotHeight
		return { top, height }
	}

	const isTimeSlotOccupied = (day, timeSlot) =>
		tasks.some(task => {
			if (task.day !== day) return false
			const slotTime = dayjs(timeSlot, 'HH:mm')
			return slotTime.isBetween(dayjs(task.startTime), dayjs(task.endTime), null, '[)')
		})

	return (
		<>
			<ScheduleGrid
				daysOfWeek={daysOfWeek}
				timeSlots={timeSlots}
				tasks={tasks}
				onTaskClick={handleTaskClick}
				onEmptySlotClick={handleEmptySlotClick}
				isTimeSlotOccupied={isTimeSlotOccupied}
				getTaskPosition={getTaskPosition}
				currentDayInCycle={currentDayInCycle}
				cycleStartDate={cycleStartDate}
			/>
			{editable && isAdmin && (
				<ScheduleModal
					visible={isModalVisible}
					onCancel={resetModal}
					onOk={handleModalOk}
					onDelete={handleDeleteTask}
					isLoading={isLoading}
					editingTask={editingTask}
					form={form}
					selectOptions={selectOptions}
					scheduleType={scheduleType}
					setScheduleType={setScheduleType}
				/>
			)}
		</>
	)
}

const EditableSchedule = props => {
	const { cycleDays: cycleDaysContext, cycleStartDate } = useWell()
	return <ScheduleView {...props} cycleDays={cycleDaysContext || 7} cycleStartDate={cycleStartDate} />
}

const IrrigationScheduleTable = props => {
	const { editable = true, cycleDays: cycleDaysProp } = props
	if (editable) {
		return <EditableSchedule {...props} />
	}
	return <ScheduleView {...props} cycleDays={cycleDaysProp || 7} cycleStartDate={null} />
}

export default IrrigationScheduleTable
