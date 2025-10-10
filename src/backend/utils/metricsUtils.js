import { millisecondsToHoursMinutes } from '../../utils/timeUtils.js'

/**
 * Computes the total scheduled irrigation duration in milliseconds.
 * @param {Array<{ startTime?: string | Date, endTime?: string | Date }>} schedules - Scheduled slots.
 * @returns {number} Total duration in milliseconds.
 */
export const sumScheduleDurationsMs = (schedules = []) =>
	schedules.reduce((total, schedule) => {
		if (!schedule?.startTime || !schedule?.endTime) return total

		const start = new Date(schedule.startTime)
		const end = new Date(schedule.endTime)
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return total

		return total + Math.max(0, end - start)
	}, 0)

/**
 * Computes the total irrigation duration in milliseconds from completed logs.
 * @param {Array<{ startedAt?: string | Date, endedAt?: string | Date }>} irrigations - Irrigation logs.
 * @returns {number} Total duration in milliseconds.
 */
export const sumIrrigationDurationsMs = (irrigations = []) =>
	irrigations.reduce((total, irrigation) => {
		if (!irrigation?.startedAt || !irrigation?.endedAt) return total

		const start = new Date(irrigation.startedAt)
		const end = new Date(irrigation.endedAt)
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return total

		return total + Math.max(0, end - start)
	}, 0)

/**
 * Formats water requirement metrics from millisecond aggregates.
 * @param {{ requiredMs?: number, receivedMs?: number }} [metrics]
 * @returns {{ requiredWater: string, receivedWater: string, remainingWater: string }}
 */
export const buildWaterMetrics = ({ requiredMs = 0, receivedMs = 0 } = {}) => ({
	requiredWater: millisecondsToHoursMinutes(requiredMs),
	receivedWater: millisecondsToHoursMinutes(receivedMs),
	remainingWater: millisecondsToHoursMinutes(Math.max(0, requiredMs - receivedMs)),
})
