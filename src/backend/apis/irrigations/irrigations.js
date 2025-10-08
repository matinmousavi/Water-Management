import { Router } from 'express'
import mongoose from '../../config/database.js'
import Irrigation from '../../models/Irrigation.model.js'
import { sendTemplatedSMS } from '../../utils/sendTemplatedSMS.js'
import dayjs from 'dayjs'
import { fieldTranslations } from '../../constants/fieldTranslations.js'
import { sanitizeQuery } from '../../utils/sanitizeQuery.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import { calculateTotalDuration } from '../../utils/calculateTotalDuration.js'
import { checkIrrigationConflict } from '../../utils/checkIrrigationConflict.js'

const router = Router()

// Utility: merge date + time into a Date object
const mergeDateTime = (dateStr, timeStr) => {
	const date = dayjs(dateStr)
	const time = dayjs(timeStr)
	const combined = date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0)
	return new Date(combined.format())
}

// Utility: extract start/end and ongoing
const extractStartAndEndTimes = body => {
	const now = new Date()
	let startedAt, endedAt
	let isOngoing = body.isOngoing

	if (body.startDate && body.startTime) startedAt = mergeDateTime(body.startDate, body.startTime)
	else if (body.startTime) startedAt = mergeDateTime(now, body.startTime)

	if (body.endDate && body.endTime) {
		endedAt = mergeDateTime(body.endDate, body.endTime)
		isOngoing = false
	} else if (body.endTime) {
		endedAt = mergeDateTime(now, body.endTime)
		isOngoing = false
	}

	return { startedAt, endedAt, isOngoing }
}

// Get land group title for display
const getLandGroupTitle = async (irrigation, well) => {
	if (!irrigation.landGroup) {
		const landDocument = await Land.findById(irrigation.land)
		if (!landDocument?.groupMemberships?.length) return null
		const membership = landDocument.groupMemberships.find(
			m => m.wellId.toString() === irrigation.well.toString() && m.startDate <= irrigation.startedAt && (!m.endDate || m.endDate >= irrigation.startedAt)
		)
		return membership ? membership.groupTitle : null
	}
	if (!well?.landGroups) return null
	const group = well.landGroups.find(g => g.groupId.toString() === irrigation.landGroup.toString())
	return group ? group.title : null
}

// Send SMS to land owner
const sendIrrigationNotificationToLandOwner = async ({ landId, irrigationDocument, endedAt, currentUser }) => {
	const landDocument = await Land.findById(landId).populate('owner', 'fullName mobile notificationsEnabled')
	if (!landDocument?.notificationsEnabled || !landDocument.owner?.mobile) return

	const recipientMobile = landDocument.owner.mobile
	const landTitle = landDocument.title

	if (!endedAt) {
		await sendTemplatedSMS({
			to: recipientMobile,
			key: 'irrigation_start_irrigator',
			variables: { land_title: landTitle, start_time: irrigationDocument.startedAt.toLocaleTimeString('fa-IR') },
		})
	} else if (irrigationDocument.duration) {
		const wellDocument = await Well.findById(irrigationDocument.well)
		await sendTemplatedSMS({
			to: recipientMobile,
			key: 'irrigation_end_irrigator',
			variables: {
				land_title: landTitle,
				duration: irrigationDocument.duration,
				well_irrigator: currentUser?.fullName || '',
				well_title: wellDocument.title,
				end_time: irrigationDocument.endedAt.toLocaleTimeString('fa-IR'),
			},
		})
	}
}

const msToHoursMinutes = ms => {
	if (!ms || ms <= 0) return '00:00'

	const totalSeconds = Math.floor(ms / 1000)
	const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
	const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')

	return `${hours}:${minutes}`
}

// GET all irrigations
router.get('/', async (req, res) => {
	try {
		const safeQuery = sanitizeQuery(req.query)
		const filter = {}
		const allowedFilters = ['land', 'well', 'createdBy', 'landGroup']

		allowedFilters.forEach(field => {
			if (safeQuery[field]) filter[field] = safeQuery[field]
		})

		let irrigations = await Irrigation.find(filter)
			.populate({ path: 'land', populate: { path: 'owner', select: 'fullName mobile' }, select: 'title owner' })
			.populate('well', 'title landGroups')
			.populate('createdBy', 'fullName mobile')
			.sort({ createdAt: -1 })
			.lean()

		if (safeQuery.landGroup) {
			const uniqueLogsMap = new Map()
			for (const log of irrigations) {
				const key = `${new Date(log.startedAt).getTime()}-${log.endedAt ? new Date(log.endedAt).getTime() : 'null'}`
				if (!uniqueLogsMap.has(key)) {
					uniqueLogsMap.set(key, log)
				}
			}
			irrigations = Array.from(uniqueLogsMap.values()).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
		}

		for (const irrigation of irrigations) {
			irrigation.landGroupTitle = await getLandGroupTitle(irrigation, irrigation.well)
			irrigation.totalReceivedWater = irrigation.endedAt
				? irrigation.duration
				: await calculateTotalDuration({
						landId: irrigation.landGroup ? null : irrigation.land?._id,
						landGroupId: irrigation.landGroup || null,
				  })
		}

		res.status(200).json({ irrigations })
	} catch (err) {
		console.error(err.message)
		res.status(500).json({ message: 'خطا در دریافت لاگ‌های آبیاری!' })
	}
})

// GET single irrigation
router.get('/:irrigationId', async (req, res) => {
	try {
		const { irrigationId } = req.params
		if (!mongoose.isValidObjectId(irrigationId)) return res.status(400).json({ message: 'شناسه آبیاری معتبر نیست.' })

		const irrigation = await Irrigation.findById(irrigationId)
			.populate({ path: 'land', populate: { path: 'owner', select: 'fullName mobile' }, select: 'title owner' })
			.populate('well', 'title landGroups')
			.populate('createdBy', 'fullName mobile')
			.lean()

		if (!irrigation) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })

		irrigation.landGroupTitle = await getLandGroupTitle(irrigation, irrigation.well)
		irrigation.totalReceivedWater = irrigation.endedAt
			? irrigation.duration
			: await calculateTotalDuration({
					landId: irrigation.landGroup ? null : irrigation.land._id,
					landGroupId: irrigation.landGroup || null,
			  })

		res.status(200).json({ irrigation })
	} catch (err) {
		console.error(err.message)
		res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// POST create irrigation
router.post('/', async (req, res) => {
	try {
		const { landId, wellId, landGroupId, note } = req.body
		const currentUser = req.user
		const { startedAt, endedAt, isOngoing } = extractStartAndEndTimes(req.body)

		if (!wellId) return res.status(400).json({ message: 'شناسه چاه (wellId) الزامی است.' })

		const wellDocument = await Well.findById(wellId)
		if (!wellDocument) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		let landIdsToCheck = []
		let mergedLandIds = []

		if (landGroupId) {
			const groupDocument = wellDocument.landGroups.find(g => g.groupId.toString() === landGroupId)
			if (!groupDocument) return res.status(404).json({ message: 'گروه پیدا نشد.' })
			landIdsToCheck = groupDocument.lands.map(l => l.toString())
			mergedLandIds = [...landIdsToCheck]
		} else {
			if (!landId) return res.status(400).json({ message: 'شناسه زمین (landId) الزامی است.' })
			landIdsToCheck = [landId.toString()]
		}

		const conflictMessage = await checkIrrigationConflict({
			wellId,
			landIds: landIdsToCheck,
			startedAt,
			endedAt,
			isOngoing,
		})
		if (conflictMessage) return res.status(400).json({ message: conflictMessage })

		let createdIrrigation = null

		if (landGroupId) {
			createdIrrigation = await Irrigation.create({
				well: wellId,
				landGroup: landGroupId,
				isGroupLog: true,
				startedAt,
				endedAt,
				isOngoing,
				note,
				createdBy: currentUser._id,
				duration: endedAt
					? calculateTotalDuration({
							landId: null,
							landGroupId,
							startedAt,
							endedAt,
					  })
					: null,
			})

			for (const land of mergedLandIds) {
				await sendIrrigationNotificationToLandOwner({
					landId: land,
					irrigationDocument: createdIrrigation,
					endedAt,
					currentUser,
				})
			}
		} else {
			createdIrrigation = await Irrigation.create({
				land: landIdsToCheck[0],
				well: wellId,
				startedAt,
				endedAt,
				isOngoing,
				note,
				createdBy: currentUser._id,
				isGroupLog: false,
				duration: endedAt
					? calculateTotalDuration({
							landId: landIdsToCheck[0],
							landGroupId: null,
							startedAt,
							endedAt,
					  })
					: null,
			})

			await sendIrrigationNotificationToLandOwner({
				landId: landIdsToCheck[0],
				irrigationDocument: createdIrrigation,
				endedAt,
				currentUser,
			})
		}

		const irrigation = await Irrigation.findById(createdIrrigation._id)
			.populate({
				path: 'land',
				populate: { path: 'owner', select: 'fullName mobile' },
				select: 'title owner',
			})
			.populate('well', 'title landGroups')
			.populate('createdBy', 'fullName mobile')
			.lean()

		if (landGroupId) {
			irrigation.landGroupTitle = await getLandGroupTitle(irrigation, irrigation.well)
		}

		return res.status(201).json({
			message: landGroupId ? 'آبیاری گروهی با موفقیت ثبت شد.' : 'آبیاری با موفقیت ثبت شد.',
			irrigation,
		})
	} catch (err) {
		console.error(err)
		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const fieldName = fieldTranslations.irrigations[firstError.path] || firstError.path
			return res.status(400).json({ message: `${fieldName} الزامی یا نامعتبر است.` })
		}
		return res.status(500).json({ message: 'خطا در ثبت آبیاری.' })
	}
})

// GET single irrigation
router.get('/:irrigationId', async (req, res) => {
	try {
		const { irrigationId } = req.params
		if (!mongoose.isValidObjectId(irrigationId)) return res.status(400).json({ message: 'شناسه آبیاری معتبر نیست.' })

		const irrigation = await Irrigation.findById(irrigationId)
			.populate({ path: 'land', populate: { path: 'owner', select: 'fullName mobile' }, select: 'title owner' })
			.populate('well', 'title landGroups')
			.populate('createdBy', 'fullName mobile')
			.lean()

		if (!irrigation) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })

		irrigation.landGroupTitle = await getLandGroupTitle(irrigation, irrigation.well)
		irrigation.totalReceivedWater = await calculateTotalDuration({
			landId: irrigation.landGroup ? null : irrigation.land._id,
			landGroupId: irrigation.landGroup || null,
		})

		res.status(200).json({ irrigation })
	} catch (err) {
		console.error(err.message)
		res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// PATCH update irrigation
router.patch('/:irrigationId', async (req, res) => {
	try {
		const { irrigationId } = req.params
		if (!mongoose.isValidObjectId(irrigationId)) return res.status(400).json({ message: 'شناسه آبیاری معتبر نیست.' })

		const irrigationDocument = await Irrigation.findById(irrigationId)
		if (!irrigationDocument) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })

		const currentUser = req.user
		const { startedAt, endedAt, isOngoing } = extractStartAndEndTimes(req.body)

		let landIdsToCheck = []
		if (irrigationDocument.landGroup) {
			const wellDocument = await Well.findById(irrigationDocument.well)
			const groupDocument = wellDocument.landGroups.find(g => g.groupId.toString() === irrigationDocument.landGroup.toString())
			if (!groupDocument) return res.status(404).json({ message: 'گروه پیدا نشد.' })
			landIdsToCheck = groupDocument.lands.map(l => l.toString())
		} else {
			landIdsToCheck = [irrigationDocument.land.toString()]
		}

		// بررسی تداخل زمانی
		const conflictMessage = await checkIrrigationConflict({
			wellId: irrigationDocument.well,
			landIds: landIdsToCheck,
			startedAt,
			endedAt,
			isOngoing,
			excludeId: irrigationDocument._id,
		})
		if (conflictMessage) return res.status(400).json({ message: conflictMessage })

		// === حالت گروهی ===
		if (irrigationDocument.landGroup) {
			// 1. همه لاگ‌های گروهی را بگیر
			const irrigations = await Irrigation.find({
				well: irrigationDocument.well,
				landGroup: irrigationDocument.landGroup,
				isGroupLog: true,
			}).sort({ startedAt: -1 })

			// 2. ادغام لاگ‌ها مثل GET /:groupId
			const mergedLogs = []
			let ongoingMerged = null

			for (const log of irrigations) {
				if (log.isOngoing) {
					if (!ongoingMerged) {
						ongoingMerged = { ...log.toObject() }
					} else {
						ongoingMerged.startedAt = new Date(Math.min(new Date(ongoingMerged.startedAt), new Date(log.startedAt)))
					}
				} else {
					mergedLogs.push(log.toObject())
				}
			}
			if (ongoingMerged) mergedLogs.unshift(ongoingMerged)

			// 3. محاسبه receivedWater فقط از لاگ‌های تمام‌شده
			const receivedMs = mergedLogs.reduce((sum, log) => {
				if (!log.isOngoing && log.endedAt) {
					return sum + (new Date(log.endedAt) - new Date(log.startedAt))
				}
				return sum
			}, 0)

			// 4. به‌روزرسانی مقدار duration روی هر لاگ تمام‌شده
			for (const log of irrigations) {
				if (!log.isOngoing && log.startedAt && log.endedAt) {
					const diffMs = new Date(log.endedAt) - new Date(log.startedAt)
					const totalSeconds = Math.floor(diffMs / 1000)
					const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
					const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
					log.duration = `${hours}:${minutes}`
					await log.save()
				}
			}

			return res.status(200).json({
				message: 'آبیاری گروهی ویرایش شد.',
				irrigation: {
					groupId: irrigationDocument.landGroup,
					isOngoing,
					receivedWater: msToHoursMinutes(receivedMs),
					logs: mergedLogs,
				},
			})
		}

		// === حالت تک‌زمینی ===
		if (startedAt) irrigationDocument.startedAt = startedAt
		if (endedAt) irrigationDocument.endedAt = endedAt

		Object.entries(req.body).forEach(([key, val]) => {
			if (!['startDate', 'startTime', 'endDate', 'endTime', 'createdBy'].includes(key)) irrigationDocument[key] = val
		})

		irrigationDocument.isOngoing = isOngoing
		irrigationDocument.createdBy = currentUser._id

		await irrigationDocument.save()

		const updated = await Irrigation.findById(irrigationId)
			.populate({
				path: 'land',
				populate: { path: 'owner', select: 'fullName mobile' },
				select: 'title owner',
			})
			.populate('well', 'title landGroups')
			.populate('createdBy', 'fullName mobile')
			.lean()

		updated.landGroupTitle = await getLandGroupTitle(updated, updated.well)

		await sendIrrigationNotificationToLandOwner({
			landId: updated.land._id,
			irrigationDocument: updated,
			endedAt,
			currentUser,
		})

		return res.status(200).json({
			message: 'آبیاری با موفقیت ویرایش شد.',
			irrigation: updated,
		})
	} catch (err) {
		console.error(err)
		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const fieldName = fieldTranslations.irrigations[firstError.path] || firstError.path
			return res.status(400).json({ message: `${fieldName} الزامی یا نامعتبر است.` })
		}
		return res.status(500).json({ message: 'خطا در ویرایش آبیاری.' })
	}
})

// DELETE irrigation
router.delete('/:irrigationId', async (req, res) => {
	try {
		const { irrigationId } = req.params
		if (!mongoose.isValidObjectId(irrigationId)) return res.status(400).json({ message: 'شناسه آبیاری معتبر نیست.' })
		const deletedIrrigation = await Irrigation.findByIdAndDelete(irrigationId)
		if (!deletedIrrigation) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })
		return res.status(200).json({ message: 'آبیاری با موفقیت حذف شد.' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	res.status(405).json({ error: 'Method Not Allowed' })
})

export default router
