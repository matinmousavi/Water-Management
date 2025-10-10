import Irrigation from '../models/Irrigation.model.js'
import Well from '../models/Well.model.js'
import Land from '../models/Land.model.js'

const getStartOfDay = date => {
	const instance = new Date(date)
	instance.setHours(0, 0, 0, 0)
	return instance
}

const isSameDay = (firstDate, secondDate) => getStartOfDay(firstDate).getTime() === getStartOfDay(secondDate).getTime()

const formatTimeHHmm = date =>
	new Intl.DateTimeFormat('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(date)

/**
 * Calculates the cumulative irrigation duration for a land or land group.
 * @param {{ landId?: string | null, landGroupId?: string | null }} params - Irrigation context.
 * @returns {Promise<string>} Total duration formatted as HH:mm.
 */
export const calculateTotalDuration = async ({ landId = null, landGroupId = null }) => {
	let irrigations = []

	if (landGroupId) {
		irrigations = await Irrigation.find({ landGroup: landGroupId, endedAt: { $ne: null } }).lean()

		const uniqueLogsMap = new Map()
		irrigations.forEach(irrigation => {
			const key = `${irrigation.startedAt.getTime()}-${irrigation.endedAt.getTime()}`
			if (!uniqueLogsMap.has(key)) uniqueLogsMap.set(key, irrigation)
		})
		irrigations = Array.from(uniqueLogsMap.values())
	} else if (landId) {
		irrigations = await Irrigation.find({ land: landId, endedAt: { $ne: null } }).lean()
	}

	let totalMinutes = 0
	for (const irrigation of irrigations) {
		if (irrigation.startedAt && irrigation.endedAt) {
			const diffMs = irrigation.endedAt - irrigation.startedAt
			totalMinutes += Math.floor(diffMs / (1000 * 60))
		}
	}

	const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
	const minutes = String(totalMinutes % 60).padStart(2, '0')
	return `${hours}:${minutes}`
}

/**
 * Validates that a planned irrigation does not overlap with existing records.
 * @param {{
 *   wellId: string,
 *   landIds?: (string | import('mongoose').Types.ObjectId)[],
 *   excludeId?: string | null,
 *   startedAt: string | Date,
 *   endedAt?: string | Date | null,
 *   isOngoing?: boolean
 * }} payload - Irrigation details to verify.
 * @returns {Promise<string | null>} Conflict message in Persian or null if safe.
 */
export const checkIrrigationConflict = async ({ wellId, landIds = [], excludeId = null, startedAt, endedAt, isOngoing }) => {
	const query = { well: wellId }
	if (excludeId) query._id = { $ne: excludeId }

	const irrigations = await Irrigation.find(query).lean()
	const newStart = new Date(startedAt)
	const newEnd = endedAt ? new Date(endedAt) : null

	if (isOngoing) {
		if (irrigations.some(irrigation => irrigation.isOngoing)) return 'این چاه در حال حاضر در حال آبیاری است.'
		return null
	}

	const well = await Well.findById(wellId).lean()
	const groupLandIdsSet = new Set()
	const groupMap = new Map()
	if (well?.landGroups?.length) {
		for (const group of well.landGroups) {
			groupMap.set(group.groupId.toString(), group)
			group.lands.forEach(land => groupLandIdsSet.add(land.toString()))
		}
	}

	const allLandIds = Array.from(groupLandIdsSet).concat(landIds)
	const lands = await Land.find({ _id: { $in: allLandIds } }).lean()
	const landMap = new Map()
	for (const land of lands) landMap.set(land._id.toString(), land)

	for (const irrigation of irrigations) {
		let irrigationLandIds = []

		if (irrigation.landGroup) {
			const group = groupMap.get(irrigation.landGroup.toString())
			if (!group || !group.lands.length) continue

			for (const landId of group.lands) {
				const land = landMap.get(landId.toString())
				if (!land || !land.groupMemberships?.length) continue

				const hasValidMembership = land.groupMemberships.some(
					membership =>
						membership.wellId.toString() === irrigation.well.toString() &&
						membership.groupId.toString() === irrigation.landGroup.toString() &&
						membership.startDate <= irrigation.startedAt &&
						(!membership.endDate || membership.endDate >= irrigation.startedAt)
				)
				if (hasValidMembership) irrigationLandIds.push(landId.toString())
			}
		} else if (irrigation.land) {
			irrigationLandIds = [irrigation.land.toString()]
		}

		const overlapLand = landIds.some(landId => irrigationLandIds.includes(landId.toString()))
		if (!overlapLand) continue

		const existingStart = new Date(irrigation.startedAt)
		const existingEnd = irrigation.endedAt ? new Date(irrigation.endedAt) : null

		if (!existingEnd) return 'همپوشانی با یک لاگ در حال آبیاری وجود دارد.'
		if (newEnd && newStart.getTime() < existingEnd.getTime() && newEnd.getTime() > existingStart.getTime()) return 'همپوشانی با یک لاگ موجود وجود دارد.'
		if (isSameDay(existingStart, newStart) && formatTimeHHmm(existingStart) === formatTimeHHmm(newStart))
			return 'ساعت شروع این لاگ با یک لاگ موجود در همان روز روی همان چاه و زمین/گروه همپوشانی دارد.'
	}

	return null
}
