import Irrigation from '../models/Irrigation.model.js'
import Well from '../models/Well.model.js'
import Land from '../models/Land.model.js'
import moment from 'moment-jalaali'

export const checkIrrigationConflict = async ({ wellId, landIds = [], excludeId = null, startedAt, endedAt, isOngoing }) => {
	const query = { well: wellId }
	if (excludeId) query._id = { $ne: excludeId }

	const irrigations = await Irrigation.find(query).lean()
	const newStart = moment(startedAt)
	const newEnd = endedAt ? moment(endedAt) : null

	if (isOngoing) {
		if (irrigations.some(i => i.isOngoing)) return 'این چاه در حال حاضر در حال آبیاری است.'
		return null
	}

	const well = await Well.findById(wellId).lean()
	const groupLandIdsSet = new Set()
	const groupMap = new Map()
	if (well?.landGroups?.length) {
		for (const group of well.landGroups) {
			groupMap.set(group.groupId.toString(), group)
			group.lands.forEach(l => groupLandIdsSet.add(l.toString()))
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
					m =>
						m.wellId.toString() === irrigation.well.toString() &&
						m.groupId.toString() === irrigation.landGroup.toString() &&
						m.startDate <= irrigation.startedAt &&
						(!m.endDate || m.endDate >= irrigation.startedAt)
				)
				if (hasValidMembership) irrigationLandIds.push(landId.toString())
			}
		} else if (irrigation.land) {
			irrigationLandIds = [irrigation.land.toString()]
		}

		const overlapLand = landIds.some(l => irrigationLandIds.includes(l.toString()))
		if (!overlapLand) continue

		const existingStart = moment(irrigation.startedAt)
		const existingEnd = irrigation.endedAt ? moment(irrigation.endedAt) : null

		if (!existingEnd) return 'همپوشانی با یک لاگ در حال آبیاری وجود دارد.'
		if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) return 'همپوشانی با یک لاگ موجود وجود دارد.'
		if (existingStart.isSame(newStart, 'day') && existingStart.format('HH:mm') === newStart.format('HH:mm'))
			return 'ساعت شروع این لاگ با یک لاگ موجود در همان روز روی همان چاه و زمین/گروه همپوشانی دارد.'
	}

	return null
}
