import { Router } from 'express'
import Well from '../../models/Well.model.js'
import mongoose from 'mongoose'
import Irrigation from '../../models/Irrigation.model.js'
import Schedule from '../../models/Schedule.model.js'

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
		const cycleEnd = new Date(cycleStart.getTime() + well.cycleDays * 24 * 60 * 60 * 1000)

		const lastIrrigationDoc = await Irrigation.findOne({
			well: well._id,
			landGroup: group.groupId,
			isGroupLog: true,
		})
			.sort({ startedAt: -1 })
			.lean()

		const lastIrrigation = lastIrrigationDoc ? lastIrrigationDoc.startedAt : null

		let nextIrrigationAt = null
		if (well.cycleDays && well.cycleStartDate) {
			const now = new Date()
			const start = new Date(well.cycleStartDate)
			const cycleDays = well.cycleDays

			const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
			const nextCycle = Math.ceil((diffDays + 1) / cycleDays) * cycleDays
			nextIrrigationAt = new Date(start)
			nextIrrigationAt.setDate(start.getDate() + nextCycle)
		}

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

		const requiredWater = msToHoursMinutes(totalRequiredMs)
		const receivedWater = msToHoursMinutes(receivedMs)
		const remainingWater = msToHoursMinutes(Math.max(0, totalRequiredMs - receivedMs))

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
			lastIrrigation,
			nextIrrigationAt,
			requiredWater,
			receivedWater,
			remainingWater,
			totalSchedulesInCycle,
			receivedWaterInCycle: receivedWater,
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
