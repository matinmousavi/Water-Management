import { Router } from 'express'
import moment from 'moment-jalaali'
import Note from '../../models/Note.model.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import User from '../../models/User.model.js'
import Schedule from '../../models/Schedule.model.js'
import Irrigation from '../../models/Irrigation.model.js'

const router = Router()

const getReference = async (type, refId) => {
	if (!type || !refId) return null

	const models = {
		land: { model: Land, fields: 'title' },
		well: { model: Well, fields: 'title' },
		personal: { model: User, fields: 'fullName' },
		landGroup: { model: Well, fields: 'landGroups' },
	}

	const config = models[type]
	if (!config) return null

	if (type === 'landGroup') {
		const wells = await Well.find({ 'landGroups.groupId': refId }).select('landGroups').lean()
		for (const well of wells) {
			const group = well.landGroups.find(g => g.groupId.toString() === refId.toString())
			if (group) return { id: refId, title: group.title }
		}
		return null
	}

	const doc = await config.model.findById(refId).select(config.fields).lean()
	if (!doc) return null

	if (type === 'personal') return { id: refId, fullName: doc.fullName }
	return { id: refId, title: doc.title }
}

function scheduleTimesForDate(schedule, referenceDay = moment().startOf('day')) {
	const ref = moment(referenceDay).startOf('day')
	const s = moment(schedule.startTime)
	const e = moment(schedule.endTime)
	const schedStart = ref
		.clone()
		.hour(s.hour())
		.minute(s.minute())
		.second(s.second() || 0)
	let schedEnd = ref
		.clone()
		.hour(e.hour())
		.minute(e.minute())
		.second(e.second() || 0)
	if (!schedEnd.isAfter(schedStart)) schedEnd.add(1, 'day')
	return { schedStart, schedEnd }
}

function isLogOutOfSchedule(log, schedule, bufferMinutes = 2, scheduleDay = moment().startOf('day')) {
	const { schedStart, schedEnd } = scheduleTimesForDate(schedule, scheduleDay)
	const logStart = moment(log.startedAt)
	const logEnd = moment(log.endedAt || log.startedAt)
	const beforeAllowed = schedStart.clone().subtract(bufferMinutes, 'minutes')
	const afterAllowed = schedEnd.clone().add(bufferMinutes, 'minutes')
	return logStart.isBefore(beforeAllowed) || logEnd.isAfter(afterAllowed)
}

router.get('/', async (req, res) => {
	try {
		const today = moment().startOf('day')
		const wells = await Well.find({ status: 'active' }).lean()
		const irrigations = await Irrigation.find().populate('well').populate('land').lean()

		let totalIrrigatedMinutes = 0
		let delayedStartCount = 0
		let outOfScheduleCount = 0
		let totalScheduledMinutes = 0
		const wellsData = []

		for (const well of wells) {
			if (!well.cycleStartDate || !well.cycleDays) continue

			const startDate = new Date(well.cycleStartDate)
			const daysPassed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
			const dayInCycle = (daysPassed % well.cycleDays) + 1

			const schedules = await Schedule.find({
				well: well._id,
				status: 'active',
				day: dayInCycle,
			})
				.populate('land')
				.populate('landGroup')
				.lean()

			if (!schedules || schedules.length === 0) continue

			for (const schedule of schedules) {
				const { schedStart, schedEnd } = scheduleTimesForDate(schedule, today)
				const schedDuration = moment(schedule.endTime).diff(moment(schedule.startTime), 'minutes')
				if (!isNaN(schedDuration) && schedDuration > 0) totalScheduledMinutes += schedDuration

				const scheduleLogs = irrigations.filter(log => {
					if (!log.well || log.well._id.toString() !== well._id.toString()) return false
					if (schedule.targetType === 'land' && log.land) {
						return log.land._id.toString() === schedule.land._id.toString() && moment(log.startedAt).isSame(today, 'day')
					}
					if (schedule.targetType === 'group' && log.landGroup) {
						return log.landGroup.toString() === schedule.landGroup?._id.toString() && moment(log.startedAt).isSame(today, 'day')
					}
					return false
				})

				if (scheduleLogs.length === 0) continue

				let totalLandMinutes = 0
				for (const log of scheduleLogs) {
					if (log.startedAt && log.endedAt) {
						const dur = moment(log.endedAt).diff(moment(log.startedAt), 'minutes')
						if (!isNaN(dur) && dur > 0) totalLandMinutes += dur
					}
				}
				totalIrrigatedMinutes += totalLandMinutes

				let status = ''
				const firstLog = scheduleLogs[0]

				if (firstLog.isOngoing) {
					status = 'در حال آبیاری'
				} else if (scheduleLogs.some(log => isLogOutOfSchedule(log, schedule, 2, today))) {
					status = 'خارج از زمانبندی'
					outOfScheduleCount++
				} else if (totalLandMinutes > schedDuration) {
					status = 'مصرف بیشتر'
				} else {
					const logEnd = moment(firstLog.endedAt)
					const endDiff = schedEnd.diff(logEnd, 'minutes')
					if (endDiff > 5) {
						status = 'توقف زودهنگام'
					} else if (moment(firstLog.startedAt).isAfter(schedStart)) {
						status = 'تاخیر'
						delayedStartCount++
					}
				}

				const waterPercent = schedDuration > 0 ? Math.min(100, Math.round((totalLandMinutes / schedDuration) * 100)) : 0

				wellsData.push({
					key: schedule._id,
					wellName: well.title,
					land: schedule.targetType === 'land' ? schedule.land?.title : null,
					group:
						schedule.targetType === 'group'
							? {
									id: schedule.landGroup?._id,
									title: schedule.landGroup?.title,
							  }
							: null,
					startTime: schedStart.format('HH:mm'),
					endTime: schedEnd.format('HH:mm'),
					status,
					waterStatus: waterPercent,
				})
			}
		}

		const progressPercent = totalScheduledMinutes > 0 ? Math.min(100, (totalIrrigatedMinutes / totalScheduledMinutes) * 100) : 0

		const unreadNotesCount = await Note.countDocuments({ user: req.user._id, isRead: false })

		res.json({
			totalIrrigatedMinutes,
			progressPercent: Math.round(progressPercent),
			delayedStartCount,
			outOfScheduleCount,
			today: today.format('jYYYY/jMM/jDD'),
			totalScheduledMinutes,
			wells: wellsData,
			unreadNotesCount,
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
})

// GET unread notes for admin dashboard
router.get('/notes', async (req, res) => {
	try {
		let notes = await Note.find({ isRead: false }).populate('user', 'fullName').sort({ createdAt: -1 }).lean()

		notes = await Promise.all(
			notes.map(async note => ({
				...note,
				reference: await getReference(note.type, note.reference),
			}))
		)

		return res.status(200).json({ notes })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: 'خطا در دریافت یادداشت‌ها' })
	}
})

// PATCH mark note as read
router.patch('/notes/:noteId/mark-read', async (req, res) => {
	try {
		const note = await Note.findById(req.params.noteId)
		if (!note) return res.status(404).json({ error: 'یادداشت پیدا نشد' })

		note.isRead = true
		await note.save()

		return res.status(200).json({ message: 'یادداشت به عنوان خوانده شده علامت‌گذاری شد' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: 'خطا در عملیات' })
	}
})

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
