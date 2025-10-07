import { useState } from 'react'
import { DatePicker, Typography } from 'antd'
import fa_IR from 'antd/locale/fa_IR'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)
dayjs.calendar('jalali')

const customDatePickerLang = {
	...fa_IR.DatePicker.lang,
	yearFormat: 'YYYY',
	monthFormat: 'MMMM',
	dateFormat: 'YYYY/MM/DD',
}

const FaDatePicker = props => {
	const [viewDate, setViewDate] = useState(dayjs())

	const handleChange = date => {
		props.onChange?.(date)
	}

	const handlePanelChange = (value, mode) => {
		setViewDate(value)
	}

	const dateRender = current => {
		const previous = dayjs(current).subtract(1, 'day')
		const isCurrentMonth = previous.month() === viewDate.subtract(1, 'day').month()

		return (
			<div className='ant-picker-cell-inner' title={previous.format('YYYY-MM-DD')}>
				<Typography.Text
					style={{
						color: isCurrentMonth ? '#000' : '#ccc',
					}}
				>
					{previous.date()}
				</Typography.Text>
			</div>
		)
	}

	return (
		<DatePicker
			{...props}
			onChange={handleChange}
			onPanelChange={handlePanelChange}
			locale={{ lang: customDatePickerLang }}
			cellRender={dateRender}
			style={{ width: '100%' }}
			format={date => {
				if (!date) return ''
				return dayjs(date).subtract(1, 'day').format('YYYY/MM/DD')
			}}
		/>
	)
}

export default FaDatePicker
