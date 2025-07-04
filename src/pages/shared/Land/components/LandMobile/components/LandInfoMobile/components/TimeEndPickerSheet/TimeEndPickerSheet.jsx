import { Button } from 'antd'
import { useState, useRef, useEffect } from 'react'
import english2persian from '../../../../../../../../../utils/english2persian'
import styles from './TimeEndPickerSheet.module.css'

const ITEM_HEIGHT = 56
const VISIBLE_COUNT = 3
const CENTER_INDEX = Math.floor(VISIBLE_COUNT / 2)

const TimeEndPickerSheet = ({ onSubmit, onClose, isOpen = true }) => {
	const now = new Date()

	const getTimeRange = () => {
		const baseTime = new Date()
		const timeList = []

		for (let offset = -30; offset <= 0; offset += 5) {
			const newTime = new Date(baseTime.getTime() + offset * 60000)
			const hour = newTime.getHours().toString().padStart(2, '0')
			const minute = newTime.getMinutes().toString().padStart(2, '0')
			timeList.push({ hour, minute })
		}
		return timeList
	}

	const timeRange = getTimeRange()

	const [selectedIndex, setSelectedIndex] = useState(6) // مرکز لیست: زمان فعلی
	const listRef = useRef(null)

	const scrollToSelected = index => {
		if (listRef.current) {
			const scrollPos = index * ITEM_HEIGHT
			listRef.current.scrollTo({ top: scrollPos, behavior: 'instant' })
		}
	}

	useEffect(() => {
		scrollToSelected(selectedIndex)
	}, [])

	const handleScroll = e => {
		const scrollTop = e.target.scrollTop
		const index = Math.round(scrollTop / ITEM_HEIGHT)
		if (timeRange[index]) setSelectedIndex(index)
	}

	const renderList = () => {
		return (
			<div className='container-scroll' style={{ flex: 1 }}>
				<div
					ref={listRef}
					onScroll={handleScroll}
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
					<div
						className='container-item-scroll'
						style={{ paddingTop: ITEM_HEIGHT * CENTER_INDEX, paddingBottom: ITEM_HEIGHT * CENTER_INDEX, textAlign: 'center' }}
					>
						{timeRange.map((time, idx) => {
							const isSelected = idx === selectedIndex
							return (
								<div
									key={idx}
									style={{
										height: ITEM_HEIGHT,
										lineHeight: `${ITEM_HEIGHT}px`,
										scrollSnapAlign: 'center',
										fontSize: 20,
										padding: '0 10px',
										fontWeight: isSelected ? '600' : '400',
										color: isSelected ? 'rgba(0,0,0,0.88)' : 'rgba(30,30,44,0.5)',
										userSelect: 'none',
										textAlign: 'center',
									}}
									className='item-scroll'
									onClick={() => setSelectedIndex(idx)}
								>
									{english2persian(`${time.minute} : ${time.hour}`)}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		)
	}

	const handleSubmit = () => {
		const selected = timeRange[selectedIndex]
		const selectedTime = new Date(now)
		selectedTime.setHours(parseInt(selected.hour))
		selectedTime.setMinutes(parseInt(selected.minute))
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
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							height: 1,
							backgroundColor: 'rgba(217, 217, 217, 1)',
							zIndex: 10,
							top: ITEM_HEIGHT * CENTER_INDEX,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							height: 1,
							backgroundColor: 'rgba(217, 217, 217, 1)',
							zIndex: 10,
							top: ITEM_HEIGHT * (CENTER_INDEX + 1),
						}}
					/>

					<div
						style={{
							height: ITEM_HEIGHT * VISIBLE_COUNT,
						}}
						className={styles.container_time}
					>
						{renderList()}
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

export default TimeEndPickerSheet
