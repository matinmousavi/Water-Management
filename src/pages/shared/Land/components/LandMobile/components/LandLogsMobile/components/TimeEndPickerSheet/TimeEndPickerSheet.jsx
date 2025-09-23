import { useState, useRef, useEffect } from 'react'
import english2persian from '../../../../../../../../../utils/english2persian'
import styles from './TimeEndPickerSheet.module.css'
import dayjs from 'dayjs'
import ModalMobile from '../../../../../../../../../components/ModalMobile/ModalMobile'

const ITEM_HEIGHT = 56
const VISIBLE_COUNT = 3
const CENTER_INDEX = Math.floor(VISIBLE_COUNT / 2)

const TimeEndPickerSheet = ({ onSubmit, onClose, isOpen = true, title = 'ثبت زمان پایان آبیاری', subtitle = 'ساعت پایان آبیاری را مشخص کنید.' }) => {
	const [minuteRange, setMinuteRange] = useState([])
	const [selectedIndex, setSelectedIndex] = useState(30)
	const listRef = useRef(null)
	const scrollTimeout = useRef(null)

	useEffect(() => {
		if (isOpen) {
			const base = dayjs()
			const list = []
			for (let i = -30; i <= 0; i++) {
				list.push(base.add(i, 'minute'))
			}
			setMinuteRange(list)
			const currentIndex = list.findIndex(t => t.minute() === base.minute())
			setSelectedIndex(currentIndex >= 0 ? currentIndex : list.length - 1)
		}
	}, [isOpen])

	useEffect(() => {
		if (listRef.current && minuteRange.length > 0) {
			const scrollPos = selectedIndex * ITEM_HEIGHT
			listRef.current.scrollTo({ top: scrollPos, behavior: 'instant' })
		}
	}, [minuteRange, selectedIndex])

	const handleScroll = e => {
		if (scrollTimeout.current) clearTimeout(scrollTimeout.current)

		scrollTimeout.current = setTimeout(() => {
			const scrollTop = e.target.scrollTop
			const index = Math.round(scrollTop / ITEM_HEIGHT)

			if (minuteRange[index]) {
				setSelectedIndex(index)
				listRef.current.scrollTo({
					top: index * ITEM_HEIGHT,
					behavior: 'smooth',
				})
			}
		}, 100)
	}

	const selectedTime = minuteRange[selectedIndex] || dayjs()
	const selectedHour = selectedTime.hour().toString().padStart(2, '0')

	const renderMinuteList = () => (
		<div className='container-scroll'>
			<div
				ref={listRef}
				onScroll={handleScroll}
				style={{
					height: ITEM_HEIGHT * VISIBLE_COUNT,
					overflowY: 'scroll',
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
						const minute = time.minute().toString().padStart(2, '0')
						return (
							<div
								key={idx}
								style={{
									height: ITEM_HEIGHT,
									lineHeight: `60px`,
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
		const timeToSend = selectedTime.second(0).millisecond(0)
		onSubmit && onSubmit(timeToSend)
	}

	return (
		<ModalMobile height={389} open={isOpen} onClose={onClose} title={title} okText='ثبت' closeText='بازگشت' handleSubmit={handleSubmit}>
			<div className={styles.subtitle}>{subtitle}</div>

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
		</ModalMobile>
	)
}

export default TimeEndPickerSheet
