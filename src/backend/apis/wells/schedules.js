import { Router } from 'express'
import Schedule from '../../models/Schedule.model.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import Irrigation from '../../models/Irrigation.model.js'

const router = Router({ mergeParams: true })

// GET schedules with last & next irrigation times + full schedule info + ongoing irrigation info
router.get('/', async (req, res) => {
	try {
		const { wellId } = req.params

		const well = await Well.findById(wellId).lean()
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const schedules = await Schedule.find({ well: wellId }).lean()

		const results = []

		for (const schedule of schedules) {
			let lastIrrigation = null
			let irrigationInProgress = false
			let irrigationStartedAt = null
			let irrigationEndsAt = null

			const ongoingLog = await Irrigation.findOne({
				isOngoing: true,
				...(schedule.targetType === 'land' ? { land: schedule.land, isGroupLog: false } : { landGroup: schedule.landGroup, isGroupLog: true }),
			}).lean()

			if (ongoingLog) {
				irrigationInProgress = true
				irrigationStartedAt = ongoingLog.startedAt

				const startTime = new Date(schedule.startTime)
				const endTime = new Date(schedule.endTime)
				const startedAt = new Date(irrigationStartedAt)

				const durationMs =
					endTime.getHours() * 3600000 + endTime.getMinutes() * 60000 - (startTime.getHours() * 3600000 + startTime.getMinutes() * 60000)

				irrigationEndsAt = new Date(startedAt.getTime() + durationMs)
			}

			if (schedule.targetType === 'land' && schedule.land) {
				const lastLog = await Irrigation.findOne({
					land: schedule.land,
					isGroupLog: false,
				})
					.sort({ startedAt: -1 })
					.lean()
				lastIrrigation = lastLog?.startedAt || null
			} else if (schedule.targetType === 'group' && schedule.landGroup) {
				const lastLog = await Irrigation.findOne({
					landGroup: schedule.landGroup,
					isGroupLog: true,
				})
					.sort({ startedAt: -1 })
					.lean()
				lastIrrigation = lastLog?.startedAt || null
			}

			const startDate = new Date(well.cycleStartDate)
			const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24))
			const cyclesPassed = Math.floor(daysPassed / well.cycleDays)
			const nextIrrigation = new Date(startDate.getTime() + (cyclesPassed + 1) * well.cycleDays * 24 * 60 * 60 * 1000)

			results.push({
				id: schedule._id,
				type: schedule.targetType,
				title: schedule.title,
				lastIrrigation,
				nextIrrigation,
				landId: schedule.targetType === 'land' ? schedule.land : undefined,
				groupId: schedule.targetType === 'group' ? schedule.landGroup : undefined,
				startTime: schedule.startTime,
				endTime: schedule.endTime,
				day: schedule.day,
				color: schedule.color,
				status: schedule.status,

				irrigationInProgress,
				irrigationStartedAt,
				irrigationEndsAt,
			})
		}

		results.sort((a, b) => new Date(a.nextIrrigation) - new Date(b.nextIrrigation))

		return res.status(200).json(results)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت زمان‌بندی‌ها.' })
	}
})

// POST create a new schedule
router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { targetType, targetId, startTime, endTime, day, color } = req.body

		let title = ''
		let land = null
		let landGroup = null

		if (targetType === 'land' && targetId) {
			const landDoc = await Land.findById(targetId).lean()
			if (!landDoc) return res.status(404).json({ message: 'زمین پیدا نشد.' })
			title = landDoc.title
			land = targetId
		} else if (targetType === 'group' && targetId) {
			const well = await Well.findById(wellId).lean()
			if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

			const group = well.landGroups.find(g => g.groupId.toString() === targetId)
			if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

			title = group.title
			landGroup = targetId
		} else {
			return res.status(400).json({ message: 'اطلاعات زمین یا گروه نامعتبر است.' })
		}

		const scheduleData = {
			well: wellId,
			targetType,
			land,
			landGroup,
			startTime,
			endTime,
			title,
			day,
			color,
			status: 'active',
		}

		const schedule = await Schedule.create(scheduleData)

		const response = {
			message: 'زمان‌بندی ایجاد شد.',
			schedule: {
				id: schedule._id,
				well: schedule.well,
				targetType: schedule.targetType,
				land: schedule.land,
				landGroup: schedule.landGroup,
				startTime: schedule.startTime,
				endTime: schedule.endTime,
				title: schedule.title,
				day: schedule.day,
				color: schedule.color,
				status: schedule.status,
			},
		}

		return res.status(201).json(response)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد زمان‌بندی.' })
	}
})

// PATCH update schedule
router.patch('/:scheduleId', async (req, res) => {
	try {
		const { scheduleId, wellId } = req.params
		const { targetType, targetId, startTime, endTime, day, color } = req.body

		let title = ''
		let land = null
		let landGroup = null

		if (targetType === 'land' && targetId) {
			const landDoc = await Land.findById(targetId).lean()
			if (!landDoc) return res.status(404).json({ message: 'زمین پیدا نشد.' })
			title = landDoc.title
			land = targetId
		} else if (targetType === 'group' && targetId) {
			const well = await Well.findById(wellId).lean()
			if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

			const group = well.landGroups.find(g => g.groupId.toString() === targetId)
			if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

			title = group.title
			landGroup = targetId
		} else {
			return res.status(400).json({ message: 'اطلاعات زمین یا گروه نامعتبر است.' })
		}

		const updates = {
			targetType,
			land,
			landGroup,
			startTime,
			endTime,
			title,
			day,
			color,
		}

		const schedule = await Schedule.findByIdAndUpdate(scheduleId, updates, { new: true })
		if (!schedule) return res.status(404).json({ message: 'زمان‌بندی پیدا نشد.' })

		const response = {
			message: 'زمان‌بندی بروزرسانی شد.',
			schedule: {
				id: schedule._id,
				well: schedule.well,
				targetType: schedule.targetType,
				land: schedule.land,
				landGroup: schedule.landGroup,
				startTime: schedule.startTime,
				endTime: schedule.endTime,
				title: schedule.title,
				day: schedule.day,
				color: schedule.color,
				status: schedule.status,
			},
		}

		return res.status(200).json(response)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در بروزرسانی زمان‌بندی.' })
	}
})

// DELETE schedule
router.delete('/:scheduleId', async (req, res) => {
	try {
		const { scheduleId } = req.params
		const schedule = await Schedule.findByIdAndDelete(scheduleId)
		if (!schedule) return res.status(404).json({ message: 'زمان‌بندی پیدا نشد.' })

		return res.status(200).json({ message: 'زمان‌بندی حذف شد.' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در حذف زمان‌بندی.' })
	}
})

export default router
