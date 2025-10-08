import { Router } from 'express'
import Well from '../../models/Well.model.js'
import mongoose from 'mongoose'
import Irrigation from '../../models/Irrigation.model.js'
import Schedule from '../../models/Schedule.model.js'
import Note from '../../models/Note.model.js'

const router = Router({ mergeParams: true })

function msToHoursMinutes(ms) {
	const totalMinutes = Math.floor(ms / 60000)
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	return `${hours}:${minutes.toString().padStart(2, '0')}`
}

function getTotalDurationMs(schedules) {
	return schedules.reduce((sum, s) => {
		const start = new Date(s.startTime)
		const end = new Date(s.endTime)
		return sum + (end - start)
	}, 0)
}

router.get('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const well = await Well.findById(wellId).populate('landGroups.lands').select('landGroups cycleDays cycleStartDate').lean()

		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const startDate = new Date(well.cycleStartDate)
		const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24))
		const cyclesPassed = Math.floor(daysPassed / well.cycleDays)
		const cycleStart = new Date(startDate.getTime() + cyclesPassed * well.cycleDays * 24 * 60 * 60 * 1000)
		const cycleEnd = new Date(cycleStart.getTime() + well.cycleDays * 24 * 60 * 60 * 1000)

		for (const group of well.landGroups) {
			const schedules = await Schedule.find({ well: wellId, landGroup: group.groupId }).lean()
			const totalSchedulesInCycle = schedules.length
			const totalRequiredMs = getTotalDurationMs(schedules)

			const irrigations = await Irrigation.find({
				well: wellId,
				landGroup: group.groupId,
				isGroupLog: true,
				startedAt: { $gte: cycleStart },
				endedAt: { $lte: cycleEnd },
			}).lean()

			const receivedMs = irrigations.reduce((sum, log) => {
				if (!log.endedAt) return sum
				return sum + (new Date(log.endedAt) - new Date(log.startedAt))
			}, 0)

			group.requiredWater = msToHoursMinutes(totalRequiredMs)
			group.receivedWater = msToHoursMinutes(receivedMs)
			group.remainingWater = msToHoursMinutes(Math.max(0, totalRequiredMs - receivedMs))
			group.totalSchedulesInCycle = totalSchedulesInCycle
			group.receivedWaterInCycle = msToHoursMinutes(receivedMs)
		}

		return res.status(200).json({ landGroups: well.landGroups || [] })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت گروه‌ها.' })
	}
})

router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { title, lands } = req.body

		if (!title) {
			return res.status(400).json({ message: 'عنوان گروه الزامی است.' })
		}

		const well = await Well.findById(wellId).populate('lands')
		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		const invalidLands = lands.filter(landId => !well.lands.some(wLand => wLand._id.equals(landId)))
		if (invalidLands.length > 0) {
			return res.status(400).json({ message: 'برخی از زمین‌ها به این چاه تعلق ندارند.' })
		}

		const group = {
			groupId: new mongoose.Types.ObjectId(),
			title,
			lands,
		}

		well.landGroups.push(group)
		await well.save()

		return res.status(201).json({ message: 'گروه زمین ایجاد شد.', group })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد گروه.' })
	}
})

router.get('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params

		const well = await Well.findById(wellId)
			.populate({
				path: 'landGroups.lands',
				populate: { path: 'owner', model: 'User', select: 'fullName mobile address' },
			})
			.lean()

		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const group = well.landGroups.find(g => g.groupId.equals(groupId))
		if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

		const startDate = new Date(well.cycleStartDate)
		const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24))
		const cyclesPassed = Math.floor(daysPassed / well.cycleDays)
		const cycleStart = new Date(startDate.getTime() + cyclesPassed * well.cycleDays * 24 * 60 * 60 * 1000)

		const schedules = await Schedule.find({ well: wellId, landGroup: group.groupId }).lean()
		const totalSchedulesInCycle = schedules.length
		const totalRequiredMs = getTotalDurationMs(schedules)

		const irrigations = await Irrigation.find({
			well: wellId,
			landGroup: group.groupId,
			isGroupLog: true,
			startedAt: { $gte: cycleStart },
		})
			.sort({ startedAt: -1 })
			.lean()

		const mergedLogs = []
		let ongoingMerged = null

		for (const log of irrigations) {
			if (log.isOngoing) {
				if (!ongoingMerged) {
					ongoingMerged = { ...log }
				} else {
					ongoingMerged.startedAt = new Date(Math.min(new Date(ongoingMerged.startedAt), new Date(log.startedAt)))
				}
			} else {
				mergedLogs.push(log)
			}
		}
		if (ongoingMerged) mergedLogs.unshift(ongoingMerged)

		const receivedMs = mergedLogs.reduce((sum, log) => {
			if (!log.isOngoing && log.endedAt) {
				return sum + (new Date(log.endedAt) - new Date(log.startedAt))
			}
			return sum
		}, 0)

		const nextIrrigationLog = mergedLogs.find(log => log.isOngoing) || null
		const nextIrrigation = nextIrrigationLog?.startedAt || null

		const notes = await Note.find({ type: 'landGroup', reference: group.groupId }).sort({ createdAt: -1 }).lean()

		return res.status(200).json({
			groupId: group.groupId,
			title: group.title,
			lands: group.lands.map(land => ({
				_id: land._id,
				title: land.title,
				owner: land.owner
					? {
							_id: land.owner._id,
							fullName: land.owner.fullName,
							mobile: land.owner.mobile,
							address: land.owner.address,
					  }
					: null,
				location: land.location || '',
			})),
			lastIrrigation: mergedLogs.length ? mergedLogs[0].startedAt : null,
			nextIrrigation,
			requiredWater: msToHoursMinutes(totalRequiredMs),
			receivedWater: msToHoursMinutes(receivedMs),
			remainingWater: msToHoursMinutes(Math.max(0, totalRequiredMs - receivedMs)),
			totalSchedulesInCycle,
			logs: mergedLogs,
			notes,
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت اطلاعات گروه.' })
	}
})

router.patch('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params
		const { title, lands } = req.body

		const well = await Well.findById(wellId).populate('lands')
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const group = well.landGroups.find(g => g.groupId.equals(groupId))
		if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

		if (title) group.title = title

		if (lands) {
			const invalidLands = lands.filter(landId => !well.lands.some(wLand => wLand._id.equals(landId)))
			if (invalidLands.length > 0) {
				return res.status(400).json({ message: 'برخی از زمین‌ها به این چاه تعلق ندارند.' })
			}
			group.lands = lands
		}

		await well.save()
		return res.status(200).json({ message: 'گروه به‌روزرسانی شد.', group })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ویرایش گروه.' })
	}
})

router.delete('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params
		const well = await Well.findById(wellId)
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const beforeCount = well.landGroups.length
		well.landGroups = well.landGroups.filter(g => !g.groupId.equals(groupId))

		if (beforeCount === well.landGroups.length) {
			return res.status(404).json({ message: 'گروه پیدا نشد.' })
		}

		await well.save()
		return res.status(200).json({ message: 'گروه حذف شد.' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در حذف گروه.' })
	}
})

export default router
