import Irrigation from '../models/Irrigation.model.js'
import Well from '../models/Well.model.js'
import moment from 'moment-jalaali'

export const checkIrrigationConflict = async ({ wellId, landIds = [], excludeId = null, startedAt, endedAt, isOngoing }) => {
	const query = { well: wellId }
	if (excludeId) query._id = { $ne: excludeId }

	const irrigations = await Irrigation.find(query).lean()
	const newStart = moment(startedAt)
	const newEnd = endedAt ? moment(endedAt) : null

	if (isOngoing) {
		const conflict = irrigations.find(i => i.isOngoing)
		if (conflict) return 'این چاه در حال حاضر در حال آبیاری است.'
		return null
	}

	for (const irrigation of irrigations) {
		let irrigationLandIds = []

		if (irrigation.isGroupLog && irrigation.landGroupLands) {
			irrigationLandIds = irrigation.landGroupLands.map(l => l.toString())
		} else if (irrigation.isGroupLog && irrigation.landGroup) {
			const well = await Well.findById(irrigation.well).lean()
			const group = well.landGroups.find(g => g.groupId.toString() === irrigation.landGroup.toString())
			if (group && group.lands) {
				irrigationLandIds = group.lands.map(l => l.toString())
			}
		} else {
			irrigationLandIds = [irrigation.land.toString()]
		}

		const overlapLand = landIds.some(l => irrigationLandIds.includes(l.toString()))
		if (!overlapLand) continue

		const existingStart = moment(irrigation.startedAt)
		const existingEnd = irrigation.endedAt ? moment(irrigation.endedAt) : null

		if (!existingEnd) {
			return 'همپوشانی با یک لاگ در حال آبیاری وجود دارد.'
		}

		if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
			return 'همپوشانی با یک لاگ موجود وجود دارد.'
		}

		if (existingStart.isSame(newStart, 'day') && existingStart.format('HH:mm') === newStart.format('HH:mm')) {
			return 'ساعت شروع این لاگ با یک لاگ موجود در همان روز روی همان چاه و زمین/گروه همپوشانی دارد.'
		}
	}

	return null
}
