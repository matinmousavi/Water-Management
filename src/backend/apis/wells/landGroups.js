import express from 'express'
import Well from '../../models/Well.model.js'
import Irrigation from '../../models/Irrigation.model.js'
import Schedule from '../../models/Schedule.model.js' // جدول زمان‌بندی
import mongoose from 'mongoose'

const msToHoursMinutes = ms => {
	const totalMinutes = Math.floor(ms / 60000)
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const router = express.Router({ mergeParams: true })

// 📌 همه گروه‌ها برای یک چاه
router.get('/', async (req, res) => {
	try {
		const { wellId } = req.params

		const well = await Well.findById(wellId)
			.populate({
				path: 'landGroups.lands',
				select: 'title area cropType location nextIrrigationAt owner',
				populate: { path: 'owner', select: 'fullName mobile' },
			})
			.lean()

		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد' })

		const now = new Date()
		const cycleStart = new Date(now)
		cycleStart.setDate(now.getDate() - 7)
		const cycleEnd = now

		const result = []

		for (const group of well.landGroups) {
			// جمع زمان مورد نیاز از جدول Schedule بر اساس startTime و endTime
			const schedules = await Schedule.find({
				landGroup: group.groupId,
				date: { $gte: cycleStart, $lte: cycleEnd },
			}).lean()

			const requiredWater = schedules.reduce((sum, s) => {
				if (s.startTime && s.endTime) {
					return sum + (new Date(s.endTime) - new Date(s.startTime)) / 60000 // دقیقه
				}
				return sum
			}, 0)

			const irrigations = await Irrigation.find({
				well: wellId,
				landGroup: group.groupId,
				isGroupLog: true,
				startedAt: { $gte: cycleStart },
				endedAt: { $lte: cycleEnd },
			})
				.populate('createdBy', 'fullName')
				.lean()

			let receivedMinutes = 0
			const logs = irrigations.map(log => {
				let duration = null
				if (log.endedAt) {
					duration = msToHoursMinutes(new Date(log.endedAt) - new Date(log.startedAt))
					receivedMinutes += (new Date(log.endedAt) - new Date(log.startedAt)) / 60000
				}
				return {
					_id: log._id,
					startedAt: log.startedAt,
					endedAt: log.endedAt,
					duration,
					isOngoing: log.isOngoing || false,
					createdBy: log.createdBy,
				}
			})

			const remainingMinutes = Math.max(0, requiredWater - receivedMinutes)

			result.push({
				groupId: group.groupId,
				title: group.title,
				lands: group.lands.map(land => ({
					_id: land._id,
					title: land.title,
					area: land.area,
					cropType: land.cropType,
					location: land.location,
					nextIrrigationAt: land.nextIrrigationAt,
					owner: land.owner ? { fullName: land.owner.fullName, mobile: land.owner.mobile } : null,
				})),
				requiredWater: msToHoursMinutes(requiredWater * 60000),
				receivedWater: msToHoursMinutes(receivedMinutes * 60000),
				remainingWater: msToHoursMinutes(remainingMinutes * 60000),
				receivedWaterInCycle: msToHoursMinutes(receivedMinutes * 60000),
				totalSchedulesInCycle: schedules.length,
				logs,
			})
		}

		return res.status(200).json({ landGroups: result })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطای سرور' })
	}
})

// 📌 یک گروه خاص
router.get('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params

		const well = await Well.findById(wellId)
			.populate({
				path: 'landGroups.lands',
				select: 'title area cropType location nextIrrigationAt owner',
				populate: { path: 'owner', select: 'fullName mobile' },
			})
			.lean()

		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد' })

		const group = well.landGroups.find(g => g.groupId.equals(groupId))
		if (!group) return res.status(404).json({ message: 'گروه پیدا نشد' })

		const now = new Date()
		const cycleStart = new Date(now)
		cycleStart.setDate(now.getDate() - 7)
		const cycleEnd = now

		const schedules = await Schedule.find({
			landGroup: group.groupId,
			date: { $gte: cycleStart, $lte: cycleEnd },
		}).lean()

		const requiredWater = schedules.reduce((sum, s) => {
			if (s.startTime && s.endTime) {
				return sum + (new Date(s.endTime) - new Date(s.startTime)) / 60000 // دقیقه
			}
			return sum
		}, 0)

		const irrigations = await Irrigation.find({
			well: wellId,
			landGroup: group.groupId,
			isGroupLog: true,
			startedAt: { $gte: cycleStart },
			endedAt: { $lte: cycleEnd },
		})
			.populate('createdBy', 'fullName')
			.lean()

		let receivedMinutes = 0
		const logs = irrigations.map(log => {
			let duration = null
			if (log.endedAt) {
				duration = msToHoursMinutes(new Date(log.endedAt) - new Date(log.startedAt))
				receivedMinutes += (new Date(log.endedAt) - new Date(log.startedAt)) / 60000
			}
			return {
				_id: log._id,
				startedAt: log.startedAt,
				endedAt: log.endedAt,
				duration,
				isOngoing: log.isOngoing || false,
				createdBy: log.createdBy,
			}
		})

		const remainingMinutes = Math.max(0, requiredWater - receivedMinutes)

		return res.status(200).json({
			landGroup: {
				groupId: group.groupId,
				title: group.title,
				lands: group.lands.map(land => ({
					_id: land._id,
					title: land.title,
					area: land.area,
					cropType: land.cropType,
					location: land.location,
					nextIrrigationAt: land.nextIrrigationAt,
					owner: land.owner ? { fullName: land.owner.fullName, mobile: land.owner.mobile } : null,
				})),
				requiredWater: msToHoursMinutes(requiredWater * 60000),
				receivedWater: msToHoursMinutes(receivedMinutes * 60000),
				remainingWater: msToHoursMinutes(remainingMinutes * 60000),
				receivedWaterInCycle: msToHoursMinutes(receivedMinutes * 60000),
				totalSchedulesInCycle: schedules.length,
				logs,
			},
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطای سرور' })
	}
})

// 📌 ایجاد یک گروه جدید برای چاه
router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { title, lands } = req.body

		if (!title) return res.status(400).json({ message: 'عنوان گروه الزامی است.' })

		const well = await Well.findById(wellId).populate('lands')
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const invalidLands = lands.filter(landId => !well.lands.some(wLand => wLand._id.equals(landId)))
		if (invalidLands.length > 0) return res.status(400).json({ message: 'برخی از زمین‌ها به این چاه تعلق ندارند.' })

		const group = {
			groupId: new mongoose.Types.ObjectId(),
			title,
			lands,
		}

		well.landGroups.push(group)
		await well.save()

		const populatedGroup = await Well.findById(wellId)
			.populate({
				path: 'landGroups.lands',
				match: { _id: { $in: lands } },
				populate: { path: 'owner', select: 'fullName mobile' },
			})
			.lean()

		const newGroup = populatedGroup.landGroups.find(g => g.groupId.equals(group.groupId))

		return res.status(201).json({ message: 'گروه زمین ایجاد شد.', group: newGroup })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد گروه.' })
	}
})

// 📌 به‌روزرسانی گروه زمین
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

		// populate owner و سایر جزئیات زمین برای پاسخ
		const populatedGroup = await Well.findById(wellId)
			.populate({
				path: 'landGroups.lands',
				match: { _id: { $in: group.lands } },
				populate: { path: 'owner', select: 'fullName mobile' },
			})
			.lean()

		const updatedGroup = populatedGroup.landGroups.find(g => g.groupId.equals(groupId))

		// گرفتن requiredWater از جدول Schedule
		const now = new Date()
		const cycleStart = new Date(now)
		cycleStart.setDate(now.getDate() - 7)
		const cycleEnd = now

		const schedules = await Schedule.find({
			landGroup: group.groupId,
			date: { $gte: cycleStart, $lte: cycleEnd },
		}).lean()

		const requiredWater = schedules.reduce((acc, s) => acc + (s.requiredWaterMinutes || 0), 0)

		return res.status(200).json({
			message: 'گروه به‌روزرسانی شد.',
			group: {
				groupId: updatedGroup.groupId,
				title: updatedGroup.title,
				lands: updatedGroup.lands.map(land => ({
					_id: land._id,
					title: land.title,
					area: land.area,
					cropType: land.cropType,
					location: land.location,
					nextIrrigationAt: land.nextIrrigationAt,
					owner: land.owner ? { fullName: land.owner.fullName, mobile: land.owner.mobile } : null,
				})),
				requiredWater: msToHoursMinutes(requiredWater * 60000),
			},
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ویرایش گروه.' })
	}
})

// 📌 حذف گروه زمین
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
