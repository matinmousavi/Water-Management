import { Router } from 'express'
import Schedule from '../../models/Schedule.model.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import Irrigation from '../../models/Irrigation.model.js'
import moment from 'moment-jalaali'

const router = Router({ mergeParams: true })

// helper function to check overlap
function isOverlapping(start1, end1, start2, end2) {
	return start1 < end2 && start2 < end1
}

// Helper: convert milliseconds to "HH:mm"
function msToHoursMinutes(ms) {
	const totalMinutes = Math.floor(ms / 60000)
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	return `${hours}:${minutes.toString().padStart(2, '0')}`
}

// Helper: sum duration of schedules
function getTotalDurationMs(schedules) {
	return schedules.reduce((sum, s) => {
		const start = new Date(s.startTime)
		const end = new Date(s.endTime)
		return sum + (end - start)
	}, 0)
}

// Helper: calculate duration between start and end in "HH:mm"
function calcDuration(startTime, endTime) {
	const ms = new Date(endTime) - new Date(startTime)
	const totalMinutes = Math.floor(ms / 60000)
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// GET all schedules
router.get('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const well = await Well.findById(wellId).lean()
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const schedules = await Schedule.find({ well: wellId }).lean()
		const results = []

		const startDate = new Date(well.cycleStartDate)
		const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24))
		const cyclesPassed = Math.floor(daysPassed / well.cycleDays)
		const dayInCycle = (daysPassed % well.cycleDays) + 1

		for (const schedule of schedules) {
			let lastIrrigation = null
			let irrigationInProgress = false
			let irrigationStartedAt = null
			let irrigationEndsAt = null

			if (schedule.targetType !== 'off') {
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
					const lastLog = await Irrigation.findOne({ land: schedule.land, isGroupLog: false }).sort({ startedAt: -1 }).lean()
					lastIrrigation = lastLog?.startedAt || null
				} else if (schedule.targetType === 'group' && schedule.landGroup) {
					const lastLog = await Irrigation.findOne({ landGroup: schedule.landGroup, isGroupLog: true }).sort({ startedAt: -1 }).lean()
					lastIrrigation = lastLog?.startedAt || null
				}
			}

			results.push({
				id: schedule._id,
				type: schedule.targetType,
				title: schedule.title,
				lastIrrigation,
				nextIrrigation: new Date(startDate.getTime() + (cyclesPassed + 1) * well.cycleDays * 24 * 60 * 60 * 1000),
				dayInCycle,
				landId: schedule.targetType === 'land' ? schedule.land : undefined,
				groupId: schedule.targetType === 'group' ? schedule.landGroup : undefined,
				startTime: schedule.startTime.toISOString(),
				endTime: schedule.endTime.toISOString(),
				day: schedule.day,
				color: schedule.color,
				status: schedule.status,
				irrigationInProgress,
				irrigationStartedAt,
				irrigationEndsAt,
				duration: calcDuration(schedule.startTime, schedule.endTime),
			})
		}

		results.sort((a, b) => new Date(a.nextIrrigation || a.startTime) - new Date(b.nextIrrigation || b.startTime))
		return res.status(200).json({ schedules: results })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت زمان‌بندی‌ها.' })
	}
})

// GET schedules for a specific day
router.get('/day/:date', async (req, res) => {
	try {
		const { wellId, date } = req.params
		const well = await Well.findById(wellId).lean()
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const targetDate = moment(date)
		if (!targetDate.isValid()) {
			return res.status(400).json({ message: 'تاریخ نامعتبر است.' })
		}

		const startDate = moment(well.cycleStartDate)
		const daysPassed = Math.floor(targetDate.diff(startDate, 'days'))
		const dayInCycle = (daysPassed % well.cycleDays) + 1

		const todayMoment = moment()
		const daysPassedToday = todayMoment.diff(startDate, 'days')
		const todayDayInCycle = (daysPassedToday % well.cycleDays) + 1

		const schedulesToday = await Schedule.find({ well: wellId, day: dayInCycle }).lean()
		const results = []

		const grouped = {}
		for (const sched of schedulesToday) {
			const key = sched.targetType === 'land' ? `land-${sched.land}` : `group-${sched.landGroup}`
			if (!grouped[key]) grouped[key] = []
			grouped[key].push(sched)
		}

		for (const key in grouped) {
			const schedGroup = grouped[key][0]
			const isOff = schedGroup.targetType === 'off'
			const targetFilter =
				schedGroup.targetType === 'land' ? { land: schedGroup.land, isGroupLog: false } : { landGroup: schedGroup.landGroup, isGroupLog: true }

			const allSchedulesInCycle = await Schedule.find({
				well: wellId,
				targetType: schedGroup.targetType,
				...(schedGroup.targetType === 'land' ? { land: schedGroup.land } : { landGroup: schedGroup.landGroup }),
			}).lean()

			const totalSchedulesInCycle = allSchedulesInCycle.length
			const totalRequiredMs = getTotalDurationMs(allSchedulesInCycle)

			let irrigationsInCycle = []
			if (schedGroup.targetType === 'group') {
				const raw = await Irrigation.find({
					well: wellId,
					landGroup: schedGroup.landGroup,
					isGroupLog: true,
					endedAt: { $ne: null },
				})
					.sort({ startedAt: 1 })
					.lean()

				const uniqueMap = new Map()
				for (const ir of raw) {
					if (!ir.startedAt || !ir.endedAt) continue
					const key2 = `${new Date(ir.startedAt).getTime()}-${new Date(ir.endedAt).getTime()}`
					if (!uniqueMap.has(key2)) uniqueMap.set(key2, ir)
				}
				irrigationsInCycle = Array.from(uniqueMap.values())
			} else {
				irrigationsInCycle = await Irrigation.find({
					well: wellId,
					land: schedGroup.land,
					isGroupLog: false,
					endedAt: { $ne: null },
				}).lean()
			}

			const receivedMsInCycle = irrigationsInCycle.reduce((sum, log) => {
				if (!log.startedAt || !log.endedAt) return sum
				return sum + (new Date(log.endedAt) - new Date(log.startedAt))
			}, 0)

			for (const schedule of grouped[key]) {
				let irrigationInProgress = false
				let irrigationStartedAt = null
				let irrigationEndsAt = null
				let lastIrrigation = null

				if (!isOff) {
					const ongoingLog = await Irrigation.findOne({
						isOngoing: true,
						...targetFilter,
					}).lean()

					if (ongoingLog) {
						irrigationInProgress = true
						irrigationStartedAt = ongoingLog.startedAt

						const startTime = moment(schedule.startTime)
						const endTime = moment(schedule.endTime)
						const startedAt = moment(irrigationStartedAt)
						const durationMs = endTime.diff(startTime)
						irrigationEndsAt = startedAt.clone().add(durationMs, 'ms')
					}

					const lastLog = await Irrigation.findOne({
						...targetFilter,
					})
						.sort({ startedAt: -1 })
						.lean()
					lastIrrigation = lastLog?.startedAt || null
				}

				const now = moment()
				let nextIrrigation = moment(schedule.startTime)
				if (nextIrrigation.isBefore(now)) {
					const endTime = moment(schedule.endTime)
					if (endTime.isAfter(now)) {
						nextIrrigation = now.clone()
					} else {
						nextIrrigation = moment(schedule.startTime).add(well.cycleDays, 'days')
					}
				}

				results.push({
					id: schedule._id,
					type: schedule.targetType,
					title: schedule.title,
					lastIrrigation,
					nextIrrigation: nextIrrigation.toISOString(),
					dayInCycle,
					todayDayInCycle,
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
					requiredWater: msToHoursMinutes(totalRequiredMs),
					receivedWater: msToHoursMinutes(receivedMsInCycle),
					remainingWater: msToHoursMinutes(Math.max(0, totalRequiredMs - receivedMsInCycle)),
					totalSchedulesInCycle,
					receivedWaterInCycle: msToHoursMinutes(receivedMsInCycle),
				})
			}
		}

		results.sort((a, b) => new Date(a.nextIrrigation || a.startTime) - new Date(b.nextIrrigation || b.startTime))

		return res.status(200).json({ schedules: results })
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

		const well = await Well.findById(wellId).lean()
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const newStart = new Date(startTime)
		const newEnd = new Date(endTime)

		if (isOverlapping(newStart, newEnd)) {
			return res.status(400).json({ message: 'زمان‌بندی با ساعت خاموشی چاه تداخل دارد.' })
		}

		const existingSchedules = await Schedule.find({ well: wellId, day }).lean()
		for (const s of existingSchedules) {
			if (s.targetType === 'off') continue
			const sStart = new Date(s.startTime)
			const sEnd = new Date(s.endTime)
			if (isOverlapping(newStart, newEnd, sStart, sEnd)) {
				return res.status(400).json({ message: `زمان‌بندی با زمان‌بندی دیگر "${s.title}" تداخل دارد.` })
			}
		}

		let title = ''
		let land = null
		let landGroup = null

		if (targetType === 'land' && targetId) {
			const landDoc = await Land.findById(targetId).lean()
			if (!landDoc) return res.status(404).json({ message: 'زمین پیدا نشد.' })
			title = landDoc.title
			land = targetId
		} else if (targetType === 'group' && targetId) {
			const group = well.landGroups.find(g => g.groupId.toString() === targetId)
			if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })
			title = group.title
			landGroup = targetId
		} else if (targetType === 'off') {
			title = 'ساعت خاموشی'
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
			status: targetType === 'off' ? 'inactive' : 'active',
		}

		const schedule = await Schedule.create(scheduleData)
		return res.status(201).json({
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
		})
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

		const well = await Well.findById(wellId).lean()
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const newStart = new Date(startTime)
		const newEnd = new Date(endTime)

		if (isOverlapping(newStart, newEnd)) {
			return res.status(400).json({ message: 'زمان‌بندی با ساعت خاموشی چاه تداخل دارد.' })
		}

		const existingSchedules = await Schedule.find({ well: wellId, day, _id: { $ne: scheduleId } }).lean()
		for (const s of existingSchedules) {
			if (s.targetType === 'off') continue
			const sStart = new Date(s.startTime)
			const sEnd = new Date(s.endTime)
			if (isOverlapping(newStart, newEnd, sStart, sEnd)) {
				return res.status(400).json({ message: `زمان‌بندی با زمان‌بندی دیگر "${s.title}" تداخل دارد.` })
			}
		}

		let title = ''
		let land = null
		let landGroup = null

		if (targetType === 'land' && targetId) {
			const landDoc = await Land.findById(targetId).lean()
			if (!landDoc) return res.status(404).json({ message: 'زمین پیدا نشد.' })
			title = landDoc.title
			land = targetId
		} else if (targetType === 'group' && targetId) {
			const group = well.landGroups.find(g => g.groupId.toString() === targetId)
			if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })
			title = group.title
			landGroup = targetId
		} else if (targetType === 'off') {
			title = 'ساعت خاموشی'
		} else {
			return res.status(400).json({ message: 'اطلاعات زمین یا گروه نامعتبر است.' })
		}

		const updates = { targetType, land, landGroup, startTime, endTime, title, day, color }
		const schedule = await Schedule.findByIdAndUpdate(scheduleId, updates, { new: true })
		if (!schedule) return res.status(404).json({ message: 'زمان‌بندی پیدا نشد.' })

		return res.status(200).json({
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
		})
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
