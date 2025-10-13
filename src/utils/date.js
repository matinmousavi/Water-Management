import dayjs from 'dayjs'

const combineDateTime = (date, time) => {
	if (!date || !time) return null

	// A date object from the date picker might be a dayjs object already
	const validDate = dayjs(date)
	const validTime = dayjs(time)

	return validDate.hour(validTime.hour()).minute(validTime.minute()).second(0).millisecond(0)
}
