import { Router } from 'express'
import Note from '../../models/Note.model.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import User from '../../models/User.model.js'
import Schedule from '../../models/Schedule.model.js'
import Irrigation from '../../models/Irrigation.model.js'
import { getProjection } from '../../utils/queryUtils.js'

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

const MINUTE_IN_MS = 60 * 1000

function startOfDay(date) {
        const ref = new Date(date)
        ref.setHours(0, 0, 0, 0)
        return ref
}

function withTime(base, timeSource) {
        const result = new Date(base)
        result.setHours(
                timeSource.getHours(),
                timeSource.getMinutes(),
                timeSource.getSeconds() || 0,
                timeSource.getMilliseconds() || 0,
        )
        return result
}

function diffInMinutes(later, earlier) {
        return Math.trunc((later.getTime() - earlier.getTime()) / MINUTE_IN_MS)
}

function addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * MINUTE_IN_MS)
}

function formatTimeHHmm(date) {
        return new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
        }).format(date)
}

function scheduleTimesForDate(schedule, referenceDay = startOfDay(new Date())) {
        const ref = startOfDay(referenceDay)
        const startTime = new Date(schedule.startTime)
        const endTime = new Date(schedule.endTime)

        const schedStart = withTime(ref, startTime)
        let schedEnd = withTime(ref, endTime)

        if (schedEnd.getTime() <= schedStart.getTime()) {
                schedEnd = addMinutes(schedEnd, 24 * 60)
        }

        return { schedStart, schedEnd }
}

function isLogOutOfSchedule(log, schedule, bufferMinutes = 2) {
        const { schedStart, schedEnd } = scheduleTimesForDate(schedule, new Date(log.startedAt))
        const logStart = new Date(log.startedAt)
        const logEnd = new Date(log.endedAt || log.startedAt)
        const beforeAllowed = addMinutes(schedStart, -bufferMinutes)
        const afterAllowed = addMinutes(schedEnd, bufferMinutes)
        return logStart.getTime() < beforeAllowed.getTime() || logEnd.getTime() > afterAllowed.getTime()
}

router.get('/', async (req, res) => {
	try {
                const wellProjection = getProjection(req)
                if (wellProjection) {
                        const requiredFields = ['status', 'cycleStartDate', 'cycleDays', 'landGroups', 'title']
                        requiredFields.forEach(field => {
                                wellProjection[field] = 1
                        })
                }
                const wells = await Well.find({ status: 'active' }, wellProjection ?? undefined).lean()
                const irrigationProjection = getProjection(req)
                if (irrigationProjection) {
                        const requiredFields = [
                                'well',
                                'land',
                                'landGroup',
                                'startedAt',
                                'endedAt',
                                'isOngoing',
                                'duration',
                                'createdAt',
                        ]
                        requiredFields.forEach(field => {
                                irrigationProjection[field] = 1
                        })
                }
                const irrigations = await Irrigation.find({}, irrigationProjection ?? undefined)
                        .populate('well')
                        .populate('land')
                        .lean()
                const scheduleProjection = getProjection(req)
                if (scheduleProjection) {
                        const requiredFields = [
                                'well',
                                'status',
                                'targetType',
                                'land',
                                'landGroup',
                                'startTime',
                                'endTime',
                                'day',
                        ]
                        requiredFields.forEach(field => {
                                scheduleProjection[field] = 1
                        })
                }

		let totalIrrigatedMinutes = 0
		let delayedStartCount = 0
		let outOfScheduleCount = 0
		let totalScheduledMinutes = 0
		const wellsData = []

		const sortedLogs = irrigations.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
		const processedGroups = new Set()
		const scheduleCache = {}

		for (const log of sortedLogs) {
			if (!log.well) continue

			const well = wells.find(w => w._id.toString() === log.well._id.toString())
			if (!well) continue

                        const logStartDate = new Date(log.startedAt)
                        const startDate = new Date(well.cycleStartDate)
                        const daysPassed = Math.floor((logStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
			const dayInCycle = (daysPassed % well.cycleDays) + 1

			let land = undefined
			let landGroup = undefined

			if (log.landGroup) {
				const groupKey = `${log.landGroup}-${log.startedAt}-${log.endedAt}`
				if (processedGroups.has(groupKey)) continue
				processedGroups.add(groupKey)

				const group = well.landGroups.find(g => g.groupId.toString() === log.landGroup.toString())
				landGroup = {
					id: log.landGroup,
					title: group ? group.title : log.landGroup.toString(),
				}
			} else if (log.land) {
				land = {
					id: log.land._id,
					title: log.land.title,
				}
			}

			const cacheKeyForStatus = `${well._id}-${dayInCycle}`
			const cacheKeyForProgress = `${well._id}-all`

                        if (!scheduleCache[cacheKeyForStatus]) {
                                scheduleCache[cacheKeyForStatus] = await Schedule.find({
                                        well: well._id,
                                        status: 'active',
                                        day: dayInCycle,
                                }, scheduleProjection ?? undefined).lean()
                        }

                        if (!scheduleCache[cacheKeyForProgress]) {
                                scheduleCache[cacheKeyForProgress] = await Schedule.find({
                                        well: well._id,
                                        status: 'active',
                                }, scheduleProjection ?? undefined).lean()
			}

			const schedulesForStatus = scheduleCache[cacheKeyForStatus].filter(
				sch =>
					(sch.targetType === 'land' && sch.land?.toString() === log.land?._id?.toString()) ||
					(sch.targetType === 'group' && sch.landGroup?.toString() === log.landGroup?.toString())
			)

			const schedulesForProgress = scheduleCache[cacheKeyForProgress].filter(
				sch =>
					(sch.targetType === 'land' && sch.land?.toString() === log.land?._id?.toString()) ||
					(sch.targetType === 'group' && sch.landGroup?.toString() === log.landGroup?.toString())
			)

			let totalSchedMinutes = 0
                        schedulesForProgress.forEach(sch => {
                                const start = new Date(sch.startTime)
                                const end = new Date(sch.endTime)
                                const dur = diffInMinutes(end, start)
                                if (!Number.isNaN(dur) && dur > 0) totalSchedMinutes += dur
                        })

			totalScheduledMinutes += totalSchedMinutes

                        const logDuration =
                                log.startedAt && log.endedAt
                                        ? diffInMinutes(new Date(log.endedAt), new Date(log.startedAt))
                                        : 0

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
                                        const logEnd = new Date(log.endedAt)
                                        const endDiff = diffInMinutes(schedEnd, logEnd)
                                        if (endDiff > 5) {
                                                status = 'توقف زودهنگام'
                                        } else if (new Date(log.startedAt).getTime() > schedStart.getTime()) {
                                                status = 'تاخیر'
                                                delayedStartCount++
                                        }
                                }
                        }

                        wellsData.push({
                                well: { id: well._id, title: well.title },
                                ...(land ? { land } : {}),
                                ...(landGroup ? { landGroup } : {}),
                                startTime: formatTimeHHmm(new Date(log.startedAt)),
                                endTime: log.endedAt ? formatTimeHHmm(new Date(log.endedAt)) : null,
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
                const projection = getProjection(req)
                let notes = await Note.find({ isRead: false }, projection ?? undefined)
                        .populate('user', 'fullName')
                        .sort({ createdAt: -1 })
                        .lean()

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
