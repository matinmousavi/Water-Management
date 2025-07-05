import { Button } from 'antd'
import { useState, useRef, useEffect } from 'react'
import english2persian from '../../../../../../../../../utils/english2persian'
import styles from './TimeEndPickerSheet.module.css'

const ITEM_HEIGHT = 56
const VISIBLE_COUNT = 3
const CENTER_INDEX = Math.floor(VISIBLE_COUNT / 2)

const TimeStartPickerSheet = ({ onSubmit, onClose, isOpen = true }) => {
	const now = new Date()
	const [minuteRange, setMinuteRange] = useState([])
	const [selectedIndex, setSelectedIndex] = useState(30)
	const listRef = useRef(null)

	useEffect(() => {
		const base = new Date()
		const list = []
		for (let i = -30; i <= 0; i++) {
			const newTime = new Date(base.getTime() + i * 60000)
			list.push(newTime)
		}
		setMinuteRange(list)
	}, [])

	useEffect(() => {
		if (listRef.current && minuteRange.length > 0) {
			const scrollPos = selectedIndex * ITEM_HEIGHT
			listRef.current.scrollTo({ top: scrollPos, behavior: 'instant' })
		}
	}, [minuteRange, selectedIndex])

	const handleScroll = e => {
		const scrollTop = e.target.scrollTop
		const index = Math.round(scrollTop / ITEM_HEIGHT)
		if (minuteRange[index]) setSelectedIndex(index)
	}

	const selectedTime = minuteRange[selectedIndex] || now
	const selectedMinute = selectedTime.getMinutes().toString().padStart(2, '0')
	const selectedHour = selectedTime.getHours().toString().padStart(2, '0')

	const renderMinuteList = () => (
		<div className='container-scroll'>
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
					style={{
						paddingTop: ITEM_HEIGHT * CENTER_INDEX,
						paddingBottom: ITEM_HEIGHT * CENTER_INDEX,
						textAlign: 'center',
					}}
				>
					{minuteRange.map((time, idx) => {
						const isSelected = idx === selectedIndex
						const minute = time.getMinutes().toString().padStart(2, '0')
						return (
							<div
								key={idx}
								style={{
									height: ITEM_HEIGHT,
									lineHeight: `60px`,
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
								{english2persian(minute)}
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)

	const handleSubmit = () => {
		onSubmit && onSubmit(selectedTime)
	}

	if (!isOpen) return null

	return (
		<div className={styles.container_fixed}>
			<div className={styles.container}>
				<div className={styles.btn_sheet} />
				<div className={styles.title}>ثبت زمان پایان آبیاری</div>
				<div className={styles.subtitle}>ساعت پایان آبیاری را مشخص کنید.</div>

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
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							gap: 8,
						}}
					>
						{renderMinuteList()}
						<div className={styles.clone}>:</div>
						<div className={styles.hour}>{english2persian(selectedHour)}</div>
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
