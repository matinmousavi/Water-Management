import { msToHoursMinutes } from '../../utils/format.js'

export const sumScheduleDurationsMs = (schedules = []) =>
	schedules.reduce((total, schedule) => {
		if (!schedule?.startTime || !schedule?.endTime) return total

		const start = new Date(schedule.startTime)
		const end = new Date(schedule.endTime)
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return total

		return total + Math.max(0, end - start)
	}, 0)

export const sumIrrigationDurationsMs = (irrigations = []) =>
	irrigations.reduce((total, irrigation) => {
		if (!irrigation?.startedAt || !irrigation?.endedAt) return total

		const start = new Date(irrigation.startedAt)
		const end = new Date(irrigation.endedAt)
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return total

		return total + Math.max(0, end - start)
	}, 0)

export const buildWaterMetrics = ({ requiredMs = 0, receivedMs = 0 } = {}) => ({
	requiredWater: msToHoursMinutes(requiredMs),
	receivedWater: msToHoursMinutes(receivedMs),
	remainingWater: msToHoursMinutes(Math.max(0, requiredMs - receivedMs)),
})
