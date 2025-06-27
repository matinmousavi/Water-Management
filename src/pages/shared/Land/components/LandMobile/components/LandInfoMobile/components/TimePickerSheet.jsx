import { Button } from 'antd'
import { useState, useRef, useEffect } from 'react'
import english2persian from '../../../../../../../../utils/english2persian'

const ITEM_HEIGHT = 56
const VISIBLE_COUNT = 3
const CENTER_INDEX = Math.floor(VISIBLE_COUNT / 2)

const TimePickerSheet = ({ onSubmit, onClose, isOpen = true }) => {
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
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(32, 34, 42, 0.56)',
				display: 'flex',
				alignItems: 'flex-end',
				justifyContent: 'center',
				zIndex: 1000,
			}}
		>
			<div
				style={{
					backgroundColor: '#fff',
					borderTopLeftRadius: 16,
					borderTopRightRadius: 16,
					width: '100%',
					paddingTop: 24,
					paddingBottom: 24,
					boxShadow: '0 8px 10px rgba(0,0,0,0.14)',
					userSelect: 'none',
					position: 'relative',
				}}
			>
				<div
					style={{
						width: 24,
						height: 4,
						backgroundColor: 'rgba(209, 212, 221, 1)',
						borderRadius: 4,
						margin: '0 auto 24px',
					}}
				/>

				<div
					style={{
						textAlign: 'center',
						fontSize: 14,
						fontWeight: '500',
						color: '#3E3E3E',
						marginBottom: 8,
					}}
				>
					ثبت زمان شروع آبیاری
				</div>

				<div
					style={{
						textAlign: 'center',
						fontSize: 14,
						fontWeight: '400',
						color: 'rgba(0, 0, 0, 0.88)',
						marginBottom: 24,
					}}
				>
					ساعت شروع آبیاری را مشخص کنید.
				</div>

				<div style={{ position: 'relative', marginBottom: 24 }}>
					{/* خطوط راهنما */}
					<div
						style={{
							position: 'absolute',
							top: ITEM_HEIGHT * CENTER_INDEX,
							left: 0,
							right: 0,
							height: 1,
							backgroundColor: 'rgba(217, 217, 217, 1)',
							zIndex: 10,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							top: ITEM_HEIGHT * (CENTER_INDEX + 1),
							left: 0,
							right: 0,
							height: 1,
							backgroundColor: 'rgba(217, 217, 217, 1)',
							zIndex: 10,
						}}
					/>

					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: ITEM_HEIGHT * VISIBLE_COUNT,
							overflow: 'hidden',
						}}
					>
						{renderList(minutes, minute, setMinute, minuteRef, 'minute')}
						<div style={{ width: 20, fontSize: 20, fontWeight: '600', textAlign: 'center' }}>:</div>
						{renderList(hours, hour, setHour, hourRef, 'hour')}
					</div>
				</div>

				<div style={{ display: 'flex', gap: 16, padding: '0 16px' }}>
					<Button onClick={onClose} style={{ width: '50%' }}>
						بازگشت
					</Button>
					<Button onClick={handleSubmit} type='primary' style={{ width: '50%' }}>
						ثبت
					</Button>
				</div>
			</div>
		</div>
	)
}

export default TimePickerSheet
