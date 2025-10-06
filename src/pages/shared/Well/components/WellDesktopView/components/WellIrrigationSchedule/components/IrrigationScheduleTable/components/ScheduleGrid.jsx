import { useEffect, useState } from 'react'
import { Tooltip } from 'antd'
import styles from '../IrrigationScheduleTable.module.css'
import { useUser } from '../../../../../../../../../../contexts/UserContext'

const ScheduleGrid = ({ daysOfWeek, timeSlots, tasks, onTaskClick, onEmptySlotClick, isTimeSlotOccupied, getTaskPosition, currentDayInCycle }) => {
	const [currentTimePos, setCurrentTimePos] = useState(null)
	const { isIrrigator } = useUser()
	const formatDurationToPersian = duration => {
		if (!duration) return ''

		const [hours, minutes] = duration.split(':').map(Number)

		let result = ''
		if (hours > 0) result += `${hours} ساعت`
		if (minutes > 0) result += `${hours > 0 ? ' و ' : ''}${minutes} دقیقه`

		return result.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
	}

	// Update current time position every minute
	useEffect(() => {
		const updateTimePosition = () => {
			const now = new Date()
			const hours = now.getHours()
			const minutes = now.getMinutes()

			// Find current time slot index
			const index = timeSlots.findIndex(slot => slot.hour === hours && slot.minute === Math.floor(minutes / 15) * 15)

			if (index !== -1) {
				// Calculate exact position (including minutes)
				const exactPos = index * 15 + (minutes % 15) * (15 / 15)
				setCurrentTimePos(exactPos)
			}
		}

		updateTimePosition()
		const timer = setInterval(updateTimePosition, 60000) // Update every minute

		return () => clearInterval(timer)
	}, [timeSlots])

	// Check if a day is the current day in cycle
	const isCurrentDayInCycle = dayIndex => {
		return currentDayInCycle !== undefined && dayIndex + 1 === currentDayInCycle
	}

	// Format time to Persian
	const formatTimeToPersian = time => {
		return time.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
	}

	return (
		<div className={styles['schedule-wrapper']}>
			<div className={styles['irrigation-schedule-container']}>
				{/* Header Row */}
				<div className={styles['schedule-header']}>
					<div className={styles['time-header']}>ساعت</div>
					{daysOfWeek.map((day, index) => (
						<div key={index} className={styles['day-header-cell']}>
							{day}
						</div>
					))}
				</div>

				{/* Grid Body */}
				<div className={styles['schedule-grid']}>
					{/* Time Column (left side) */}
					<div className={styles['time-column']}>
						<div className={styles['time-column-content']} style={{ height: `${timeSlots.length * 15}px` }}>
							{timeSlots.map((timeSlot, index) => {
								if (timeSlot.minute === 0) {
									return (
										<div
											key={index}
											className={`${styles['time-label-absolute']} ${index === 0 ? styles['first-label'] : ''}`}
											style={{ top: `${index * 15}px` }}
										>
											{formatTimeToPersian(timeSlot.hour)}:۰۰
										</div>
									)
								}
								return null
							})}
						</div>
					</div>

					{/* Day Columns */}
					{daysOfWeek.map((day, dayIndex) => (
						<div key={dayIndex} className={`${styles['day-column']} ${isCurrentDayInCycle(dayIndex) ? styles['current-day-column'] : ''}`}>
							<div className={styles['day-content']} style={{ height: `${timeSlots.length * 15}px` }}>
								{/* Grid lines */}
								{timeSlots.map((timeSlot, timeIndex) => {
									const occupied = isTimeSlotOccupied(dayIndex + 1, timeSlot.value)

									return !isIrrigator ? (
										<div
											className={`${styles['grid-line']} ${timeIndex % 4 === 3 ? styles['hour-bold'] : ''}`}
											style={{
												top: timeIndex * 15,
												height: '15px',
												cursor: occupied ? 'default' : 'pointer',
											}}
											onClick={() => {
												if (!occupied) {
													onEmptySlotClick(dayIndex + 1, timeSlot.value)
												}
											}}
										/>
									) : (
										<div
											key={timeIndex}
											className={`${styles['grid-line']} ${timeIndex % 4 === 3 ? styles['hour-bold'] : ''}`}
											style={{
												top: timeIndex * 15,
												height: '15px',
											}}
										/>
									)
								})}

								{/* Tasks */}
								{tasks
									.filter(task => task.day === dayIndex + 1)
									.map(task => {
										const { top, height } = getTaskPosition(task)

										return isIrrigator ? (
											<div
												onClick={() => onTaskClick(task)}
												className={styles['task-card']}
												style={{
													top: `${top}px`,
													height: `${height}px`,
													backgroundColor: task.color || '#e0f7e980',
												}}
											>
												<div className={styles['task-name']}>{task.title}</div>
												<div className={styles['task-duration']}>{task.duration && formatDurationToPersian(task.duration)}</div>
											</div>
										) : (
											<Tooltip
												key={task._id}
												title={<div>مدت زمان: {task.duration && task.duration.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}</div>}
											>
												<div
													onClick={() => onTaskClick(task)}
													className={styles['task-card']}
													style={{
														top: `${top}px`,
														height: `${height}px`,
														backgroundColor: task.color || '#e0f7e980',
													}}
												>
													<div className={styles['task-name']}>{task.title}</div>
												</div>
											</Tooltip>
										)
									})}

								{/* Current time indicator (red line) */}
								{isCurrentDayInCycle(dayIndex) && currentTimePos !== null && (
									<div className={styles['current-time-line']} style={{ top: `${currentTimePos}px` }}>
										<div className={styles['current-time-circle']} />
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default ScheduleGrid
