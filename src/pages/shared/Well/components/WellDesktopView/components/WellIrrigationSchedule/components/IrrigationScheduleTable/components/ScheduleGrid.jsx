import { useEffect, useState } from 'react'
import styles from '../IrrigationScheduleTable.module.css'
import dayjs from 'dayjs'

const ScheduleGrid = ({ daysOfWeek, timeSlots, tasks, onTaskClick, onEmptySlotClick, isTimeSlotOccupied, getTaskPosition, currentDayInCycle }) => {
	const [currentTimePos, setCurrentTimePos] = useState(null)

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
		return currentDayInCycle !== undefined && dayIndex === currentDayInCycle - 1
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
						<div key={index} className={`${styles['day-header-cell']}`}>
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
												onEmptySlotClick(dayIndex, timeSlot.value)
											}
										}}
									/>
								))}

								{/* Tasks */}
								{tasks
									.filter(task => task.day === dayIndex)
									.map(task => {
										const { top, height } = getTaskPosition(task)
										return (
											<div
												key={task._id}
												onClick={() => onTaskClick(task)}
												className={styles['task-card']}
												style={{
													top: `${top}px`,
													height: `${height}px`,
													backgroundColor: task.color || '#e0f7e980',
													border: isCurrentDayInCycle(dayIndex) ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
												}}
											>
												<div className={styles['task-name']}>{task.title}</div>
											</div>
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
