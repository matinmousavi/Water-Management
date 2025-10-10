const MS_PER_HOUR = 60 * 60 * 1000
const MS_PER_MINUTE = 60 * 1000

/**
 * Converts a HH:mm duration string to milliseconds.
 * @param {string | null | undefined} duration - Duration formatted as HH:mm.
 * @returns {number | null} Duration expressed in milliseconds.
 */
export const parseDurationToMilliseconds = duration => {
	if (!duration) return null
	const [hours, minutes] = duration.split(':').map(Number)
	if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
	return hours * MS_PER_HOUR + minutes * MS_PER_MINUTE
}

/**
 * Converts a duration in milliseconds to an HH:mm string.
 * @param {number} milliseconds - Duration in milliseconds.
 * @returns {string} Duration formatted as HH:mm.
 */
export const millisecondsToHoursMinutes = milliseconds => {
	const safeMilliseconds = Math.max(0, milliseconds)
	const totalMinutes = Math.floor(safeMilliseconds / MS_PER_MINUTE)
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	return `${hours}:${minutes.toString().padStart(2, '0')}`
}
