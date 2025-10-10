import { Router } from 'express'
import Schedule from '../../models/Schedule.model.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import Irrigation from '../../models/Irrigation.model.js'
import { getProjection } from '../../utils/queryUtils.js'
import { buildWaterMetrics, sumIrrigationDurationsMs, sumScheduleDurationsMs } from '../../utils/metricsUtils.js'

const router = Router({ mergeParams: true })

const DAY_IN_MS = 24 * 60 * 60 * 1000

function startOfDay(date) {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return d
}

function diffInDays(later, earlier) {
        return Math.floor((startOfDay(later).getTime() - startOfDay(earlier).getTime()) / DAY_IN_MS)
}

function addDays(date, days) {
        return new Date(new Date(date).getTime() + days * DAY_IN_MS)
}

// helper function to check overlap
function isOverlapping(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1
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
                const wellProjection = getProjection(req)
                if (wellProjection) {
                        const requiredWellFields = ['cycleStartDate', 'cycleDays']
                        requiredWellFields.forEach(field => {
                                wellProjection[field] = 1
                        })
                }
                const well = await Well.findById(wellId, wellProjection ?? undefined).lean()
                if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

                const scheduleProjection = getProjection(req)
                if (scheduleProjection) {
                        const requiredFields = [
                                'targetType',
                                'title',
                                'land',
                                'landGroup',
                                'startTime',
                                'endTime',
                                'day',
                                'color',
                                'status',
                        ]
                        requiredFields.forEach(field => {
                                scheduleProjection[field] = 1
                        })
                }
                const schedules = await Schedule.find({ well: wellId }, scheduleProjection ?? undefined).lean()
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
                                const irrigationProjection = getProjection(req)
                                if (irrigationProjection) {
                                        const requiredFields = [
                                                'isOngoing',
                                                'land',
                                                'landGroup',
                                                'startedAt',
                                                'endedAt',
                                        ]
                                        requiredFields.forEach(field => {
                                                irrigationProjection[field] = 1
                                        })
                                }
                                const ongoingLog = await Irrigation.findOne({
                                        isOngoing: true,
                                        ...(schedule.targetType === 'land' ? { land: schedule.land, isGroupLog: false } : { landGroup: schedule.landGroup, isGroupLog: true }),
                                }, irrigationProjection ?? undefined).lean()

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
                                        const lastLog = await Irrigation.findOne({ land: schedule.land, isGroupLog: false }, irrigationProjection ?? undefined)
                                                .sort({ startedAt: -1 })
                                                .lean()
					lastIrrigation = lastLog?.startedAt || null
				} else if (schedule.targetType === 'group' && schedule.landGroup) {
                                        const lastLog = await Irrigation.findOne({ landGroup: schedule.landGroup, isGroupLog: true }, irrigationProjection ?? undefined)
                                                .sort({ startedAt: -1 })
                                                .lean()
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
                const wellProjection = getProjection(req)
                if (wellProjection) {
                        const requiredWellFields = ['cycleStartDate', 'cycleDays']
                        requiredWellFields.forEach(field => {
                                wellProjection[field] = 1
                        })
                }
                const well = await Well.findById(wellId, wellProjection ?? undefined).lean()
                if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

                const targetDate = new Date(date)
                if (Number.isNaN(targetDate.getTime())) {
                        return res.status(400).json({ message: 'تاریخ نامعتبر است.' })
                }

                const startDate = new Date(well.cycleStartDate)
                const daysPassed = diffInDays(targetDate, startDate)
                const dayInCycle = (daysPassed % well.cycleDays) + 1

                const today = new Date()
                const daysPassedToday = diffInDays(today, startDate)
                const todayDayInCycle = (daysPassedToday % well.cycleDays) + 1

                const scheduleProjection = getProjection(req)
                if (scheduleProjection) {
                        const requiredFields = [
                                'targetType',
                                'title',
                                'land',
                                'landGroup',
                                'startTime',
                                'endTime',
                                'day',
                                'color',
                                'status',
                        ]
                        requiredFields.forEach(field => {
                                scheduleProjection[field] = 1
                        })
                }
                const schedulesToday = await Schedule.find({ well: wellId, day: dayInCycle }, scheduleProjection ?? undefined).lean()
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
                        }, scheduleProjection ?? undefined).lean()

			const totalSchedulesInCycle = allSchedulesInCycle.length
			const totalRequiredMs = sumScheduleDurationsMs(allSchedulesInCycle)

                        const irrigationProjection = getProjection(req)
                        if (irrigationProjection) {
                                const requiredFields = [
                                        'well',
                                        'land',
                                        'landGroup',
                                        'isGroupLog',
                                        'isOngoing',
                                        'startedAt',
                                        'endedAt',
                                        'duration',
                                        'createdAt',
                                ]
                                requiredFields.forEach(field => {
                                        irrigationProjection[field] = 1
                                })
                        }
                        let irrigationsInCycle = []
                        if (schedGroup.targetType === 'group') {
                                const raw = await Irrigation.find({
                                        well: wellId,
                                        landGroup: schedGroup.landGroup,
                                        isGroupLog: true,
                                        endedAt: { $ne: null },
                                }, irrigationProjection ?? undefined)
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
                                }, irrigationProjection ?? undefined).lean()
			}

			const receivedMsInCycle = sumIrrigationDurationsMs(irrigationsInCycle)
			const waterMetrics = buildWaterMetrics({ requiredMs: totalRequiredMs, receivedMs: receivedMsInCycle })

			for (const schedule of grouped[key]) {
				let irrigationInProgress = false
				let irrigationStartedAt = null
				let irrigationEndsAt = null
				let lastIrrigation = null

                                if (!isOff) {
                                        const ongoingLog = await Irrigation.findOne({
                                                isOngoing: true,
                                                ...targetFilter,
                                        }, irrigationProjection ?? undefined).lean()

                                        if (ongoingLog) {
                                                irrigationInProgress = true
                                                irrigationStartedAt = ongoingLog.startedAt

                                                const startTime = new Date(schedule.startTime)
                                                const endTime = new Date(schedule.endTime)
                                                const startedAt = new Date(irrigationStartedAt)
                                                const durationMs = endTime.getTime() - startTime.getTime()
                                                irrigationEndsAt = new Date(startedAt.getTime() + durationMs)
                                        }

                                        const lastLog = await Irrigation.findOne({
                                                ...targetFilter,
                                        }, irrigationProjection ?? undefined)
                                                .sort({ startedAt: -1 })
                                                .lean()
					lastIrrigation = lastLog?.startedAt || null
				}

                                const now = new Date()
                                let nextIrrigation = new Date(schedule.startTime)
                                if (nextIrrigation.getTime() < now.getTime()) {
                                        const endTime = new Date(schedule.endTime)
                                        if (endTime.getTime() > now.getTime()) {
                                                nextIrrigation = new Date(now)
                                        } else {
                                                nextIrrigation = addDays(schedule.startTime, well.cycleDays)
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
					...waterMetrics,
					totalSchedulesInCycle,
					receivedWaterInCycle: waterMetrics.receivedWater,
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
