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

function isLogOutOfSchedule(log, schedule, bufferMinutes = 2) {
	const { schedStart, schedEnd } = scheduleTimesForDate(schedule, moment(log.startedAt))
	const logStart = moment(log.startedAt)
	const logEnd = moment(log.endedAt || log.startedAt)
	const beforeAllowed = schedStart.clone().subtract(bufferMinutes, 'minutes')
	const afterAllowed = schedEnd.clone().add(bufferMinutes, 'minutes')
	return logStart.isBefore(beforeAllowed) || logEnd.isAfter(afterAllowed)
}

router.get('/', async (req, res) => {
	try {
		const wells = await Well.find({ status: 'active' }).lean()
		const irrigations = await Irrigation.find().populate('well').populate('land').lean()

		let totalIrrigatedMinutes = 0
		let delayedStartCount = 0
		let outOfScheduleCount = 0
		let totalScheduledMinutes = 0
		const wellsData = []

		const sortedLogs = irrigations.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))

		const processedGroups = new Set()

		for (const log of sortedLogs) {
			if (!log.well) continue

			const well = wells.find(w => w._id.toString() === log.well._id.toString())
			if (!well) continue

			const logStartDate = moment(log.startedAt)
			const startDate = new Date(well.cycleStartDate)
			const daysPassed = Math.floor((logStartDate.valueOf() - startDate.getTime()) / (1000 * 60 * 60 * 24))
			const dayInCycle = (daysPassed % well.cycleDays) + 1

			let key = log._id
			let landTitle = log.land?.title || null
			let groupInfo = null

			if (log.landGroup) {
				const groupKey = `${log.landGroup}-${log.startedAt}-${log.endedAt}`
				if (processedGroups.has(groupKey)) continue
				processedGroups.add(groupKey)

				const group = well.landGroups.find(g => g.groupId.toString() === log.landGroup.toString())
				if (group) {
					groupInfo = { id: group.groupId, title: group.title }
				} else {
					groupInfo = { id: log.landGroup, title: log.landGroup.toString() }
				}

				landTitle = null
				key = log.landGroup + '-' + log.startedAt
			}

			const schedulesForStatus = await Schedule.find({
				well: well._id,
				status: 'active',
				day: dayInCycle,
				$or: [
					{ targetType: 'land', land: log.land?._id },
					{ targetType: 'group', landGroup: log.landGroup },
				],
			}).lean()

			const schedulesForProgress = await Schedule.find({
				well: well._id,
				status: 'active',
				$or: [
					{ targetType: 'land', land: log.land?._id },
					{ targetType: 'group', landGroup: log.landGroup },
				],
			}).lean()

			let totalSchedMinutes = 0
			schedulesForProgress.forEach(sch => {
				const dur = moment(sch.endTime).diff(moment(sch.startTime), 'minutes')
				if (!isNaN(dur) && dur > 0) totalSchedMinutes += dur
			})

			const logDuration = log.startedAt && log.endedAt ? moment(log.endedAt).diff(moment(log.startedAt), 'minutes') : 0
			totalIrrigatedMinutes += logDuration

			const waterPercent = totalSchedMinutes > 0 ? Math.min(100, Math.round((logDuration / totalSchedMinutes) * 100)) : 0

			let status = ''
			if (log.isOngoing) {
				status = 'در حال آبیاری'
			} else if (schedulesForStatus.some(sch => isLogOutOfSchedule(log, sch, 2))) {
				status = 'خارج از زمانبندی'
				outOfScheduleCount++
			} else if (logDuration > totalSchedMinutes) {
				status = 'مصرف بیشتر'
			} else {
				const firstSchedule = schedulesForStatus[0]
				if (firstSchedule) {
					const { schedStart, schedEnd } = scheduleTimesForDate(firstSchedule, logStartDate)
					const logEnd = moment(log.endedAt)
					const endDiff = schedEnd.diff(logEnd, 'minutes')
					if (endDiff > 5) {
						status = 'توقف زودهنگام'
					} else if (moment(log.startedAt).isAfter(schedStart)) {
						status = 'تاخیر'
						delayedStartCount++
					}
				}
			}

			wellsData.push({
				key,
				wellName: well.title,
				land: landTitle,
				group: groupInfo,
				startTime: moment(log.startedAt).format('HH:mm'),
				endTime: log.endedAt ? moment(log.endedAt).format('HH:mm') : null,
				status,
				waterStatus: waterPercent,
			})
		}

		const progressPercent = totalScheduledMinutes > 0 ? Math.min(100, (totalIrrigatedMinutes / totalScheduledMinutes) * 100) : 0
		const unreadNotesCount = await Note.countDocuments({ user: req.user._id, isRead: false })

		res.json({
			totalIrrigatedMinutes,
			progressPercent: Math.round(progressPercent),
			delayedStartCount,
			outOfScheduleCount,
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
