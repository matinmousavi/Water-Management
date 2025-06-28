import { Button } from 'antd'
import { useState, useRef, useEffect } from 'react'
import english2persian from '../../../../../../../../../utils/english2persian'
import styles from './TimeStartPickerSheet.module.css'

const ITEM_HEIGHT = 56
const VISIBLE_COUNT = 3
const CENTER_INDEX = Math.floor(VISIBLE_COUNT / 2)

const TimeStartPickerSheet = ({ onSubmit, onClose, isOpen = true }) => {
	const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
	const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

	const [hour, setHour] = useState('06')
	const [minute, setMinute] = useState('28')

	const hourRef = useRef(null)
	const minuteRef = useRef(null)

	const scrollToSelected = (ref, index) => {
		if (ref.current) {
			const scrollPos = index * ITEM_HEIGHT
			ref.current.scrollTo({ top: scrollPos, behavior: 'instant' })
		}
	}

	useEffect(() => {
		scrollToSelected(hourRef, hours.indexOf(hour))
		scrollToSelected(minuteRef, minutes.indexOf(minute))
	}, [])

	const handleScroll = (e, type) => {
		const scrollTop = e.target.scrollTop
		const index = Math.round(scrollTop / ITEM_HEIGHT)
		if (type === 'hour' && hours[index]) setHour(hours[index])
		if (type === 'minute' && minutes[index]) setMinute(minutes[index])
	}

	const renderList = (items, selected, setSelected, ref, type) => {
		return (
			<div style={{ flex: 1 }}>
				<div
					ref={ref}
					onScroll={e => handleScroll(e, type)}
					style={{
						height: ITEM_HEIGHT * VISIBLE_COUNT,
						overflowY: 'scroll',
						scrollSnapType: 'y mandatory',
						scrollPaddingTop: `${ITEM_HEIGHT * CENTER_INDEX}px`,
						scrollPaddingBottom: `${ITEM_HEIGHT * CENTER_INDEX}px`,
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
					}}
					className='no-scrollbar'
				>
					<div style={{ paddingTop: ITEM_HEIGHT * CENTER_INDEX, paddingBottom: ITEM_HEIGHT * CENTER_INDEX }}>
						{items.map((item, idx) => {
							const isSelected = item === selected
							return (
								<div
									key={idx}
									style={{
										height: ITEM_HEIGHT,
										lineHeight: `${ITEM_HEIGHT}px`,
										textAlign: 'center',
										scrollSnapAlign: 'center',
										fontSize: 20,
										fontWeight: isSelected ? '600' : '400',
										color: isSelected ? 'rgba(0,0,0,0.88)' : 'rgba(30,30,44,0.5)',
										userSelect: 'none',
									}}
									onClick={() => setSelected(item)}
								>
									{english2persian(item)}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		)
	}

	const handleSubmit = () => {
		const now = new Date()
		const selectedTime = new Date(now)
		selectedTime.setHours(parseInt(hour))
		selectedTime.setMinutes(parseInt(minute))
		selectedTime.setSeconds(0)
		onSubmit && onSubmit(selectedTime)
	}

	if (!isOpen) return null

	return (
		<div className={styles.container_fixed}>
			<div className={styles.container}>
				<div className={styles.btn_sheet} />

				<div className={styles.title}>ثبت زمان شروع آبیاری</div>

				<div className={styles.subtitle}>ساعت شروع آبیاری را مشخص کنید.</div>

				<div className={styles.container_time_lines}>
					{/* خطوط راهنما */}
					<div
						style={{
							top: ITEM_HEIGHT * CENTER_INDEX,
						}}
						className={styles.line}
					/>
					<div
						style={{
							top: ITEM_HEIGHT * (CENTER_INDEX + 1),
						}}
						className={styles.line}
					/>

					<div
						style={{
							height: ITEM_HEIGHT * VISIBLE_COUNT,
						}}
						className={styles.container_time}
					>
						{renderList(minutes, minute, setMinute, minuteRef, 'minute')}
						<div className={styles.clone}>:</div>
						{renderList(hours, hour, setHour, hourRef, 'hour')}
					</div>
				</div>

				<div className={styles.container_buttons}>
					<Button onClick={onClose} className={styles.btn}>
						بازگشت
					</Button>
					<Button onClick={handleSubmit} type='primary' className={styles.btn}>
						ثبت
					</Button>
				</div>
			</div>
		</div>
	)
}

export default TimeStartPickerSheet
