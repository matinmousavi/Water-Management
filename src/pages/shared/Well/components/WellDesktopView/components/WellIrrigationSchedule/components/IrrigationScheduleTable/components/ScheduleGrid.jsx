import styles from '../IrrigationScheduleTable.module.css'

const ScheduleGrid = ({ daysOfWeek, timeSlots, tasks, onTaskClick, onEmptySlotClick, isTimeSlotOccupied, getTaskPosition }) => {
	return (
		<div className={styles['schedule-wrapper']}>
			<div className={styles['irrigation-schedule-container']}>
				{/* Header */}
				<div className={styles['schedule-header']}>
					<div className={styles['time-header']}>ساعت</div>
					{daysOfWeek.map((day, index) => (
						<div key={index} className={styles['day-header-cell']}>
							{day}
						</div>
					))}
				</div>

				{/* Grid */}
				<div className={styles['schedule-grid']}>
					{/* Time Column */}
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
						</div>
					</div>

					{/* Day Columns */}
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
												onEmptySlotClick(dayIndex, timeSlot.value)
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
										)
									})}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default ScheduleGrid
