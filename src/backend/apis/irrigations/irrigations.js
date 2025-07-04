import { Router } from 'express'
import mongoose from '../../config/database.js'
import Irrigation from '../../models/Irrigation.model.js'
import Land from '../../models/Land.model.js'
import { sendTemplatedSMS } from '../../utils/sendTemplatedSMS.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import { isAdmin } from '../../middlewares/auth.js'
import { fieldTranslations } from '../../constants/fieldTranslations.js'
import { sanitizeQuery } from '../../utils/sanitizeQuery.js'

const router = Router()

dayjs.extend(utc)
dayjs.extend(timezone)

const mergeDateTime = (dateStr, timeStr) => {
	const date = dayjs(dateStr)
	const time = dayjs(timeStr)
	const combined = date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0)
	return combined.utc().toDate()
}

// GET all irrigations
router.get('/', async (req, res) => {
	try {
		const safeQuery = sanitizeQuery(req.query)
		const filter = {}
		const allowedFilters = ['land', 'well', 'createdBy']

		allowedFilters.forEach(field => {
			if (safeQuery[field]) {
				filter[field] = safeQuery[field]
			}
		})

		const irrigations = await Irrigation.find(filter)
			.populate('land', 'title')
			.populate('well', 'title')
			.populate('createdBy', 'firstName lastName mobile')
			.sort({ createdAt: -1 })
			.lean()

		return res.status(200).json({ irrigations })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در دریافت لاگ‌های آبیاری!' })
	}
})

// GET single irrigation
router.get('/:irrigationId', async (req, res) => {
	try {
		const { irrigationId } = req.params
		const irrigation = await Irrigation.findById(irrigationId)
			.populate('land', 'title')
			.populate('well', 'title')
			.populate('createdBy', 'firstName lastName mobile')
			.lean()

		if (!irrigation) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })
		return res.status(200).json({ irrigation })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// POST create irrigation
router.post('/', async (req, res) => {
	try {
		let { landId, wellId, startDate, startTime, endDate, endTime, notes, isOngoing, isStart, isEnd } = req.body
		const userId = req.user._id
		const now = new Date()

		// if (isStart && !isAdmin) {
		// 	startDate = now
		// 	startTime = now
		// 	endDate = null
		// 	endTime = null
		// }
		if (isStart) {
			startDate = new Date(startDate)
			startTime = new Date(startTime)
		}

		if (isEnd && !isAdmin) {
			endDate = now
			endTime = now
			isOngoing = false
		}

		if (isAdmin) {
			if (startDate && startTime) startDate = mergeDateTime(startDate, startTime)
			if (endDate && endTime) {
				endDate = mergeDateTime(endDate, endTime)
				isOngoing = false
			}
		}

		const existing = await Irrigation.findOne({ land: landId, well: wellId, isOngoing: true, endedAt: null })
		if (existing) {
			return res.status(400).json({ message: 'این زمین هم‌اکنون در حال آبیاری با این چاه است و هنوز پایان نیافته.' })
		}

		const created = await Irrigation.create({ land: landId, well: wellId, startedAt: startDate, endedAt: endDate, notes, isOngoing, createdBy: userId })

		const irrigation = await Irrigation.findById(created._id)
			.populate('createdBy', 'firstName lastName mobile')
			.populate({ path: 'land', populate: { path: 'owner', select: 'firstName lastName mobile' }, select: 'title owner' })

		const land = await Land.findById(landId).populate('owner', 'firstName lastName mobile')
		if (land?.owner?.mobile) {
			const to = land.owner.mobile
			const landName = land.title
			if (isStart) {
				await sendTemplatedSMS({ to, key: 'irrigation_start', variables: { landName, time: now.toLocaleTimeString('fa-IR') } })
			}
			if (!isOngoing && irrigation.duration) {
				await sendTemplatedSMS({ to, key: 'irrigation_end', variables: { landName, duration: irrigation.duration } })
			}
		}

		return res.status(201).json({ message: 'آبیاری با موفقیت ثبت شد.', irrigation })
	} catch (err) {
		console.error(err)
		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations.irrigations[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی یا نامعتبر است.` })
		}
		return res.status(500).json({ message: 'خطا در ثبت آبیاری.' })
	}
})

// PATCH update irrigation
router.patch('/:irrigationId', async (req, res) => {
	try {
		const { irrigationId } = req.params
		if (!mongoose.isValidObjectId(irrigationId)) {
			return res.status(400).json({ message: 'شناسه آبیاری معتبر نیست.' })
		}

		const irrigation = await Irrigation.findById(irrigationId)
		if (!irrigation) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })

		const prevOngoing = irrigation.isOngoing
		const now = new Date()

		if (req.body.isStart && !isAdmin) irrigation.startedAt = now
		if (req.body.isEnd && !isAdmin) {
			irrigation.endedAt = now
			irrigation.isOngoing = false
		}

		if (isAdmin) {
			const { startDate, startTime, endDate, endTime } = req.body
			if (startDate && startTime) irrigation.startedAt = mergeDateTime(startDate, startTime)
			if (endDate && endTime) {
				irrigation.endedAt = mergeDateTime(endDate, endTime)
				irrigation.isOngoing = false
			}
		}

		Object.entries(req.body).forEach(([key, val]) => {
			if (!['isStart', 'isEnd', 'startDate', 'startTime', 'endDate', 'endTime'].includes(key)) irrigation[key] = val
		})

		await irrigation.save()

		const updated = await Irrigation.findById(irrigationId).populate('land', 'title').populate('well', 'title').populate('createdBy', 'firstName lastName')

		const land = await Land.findById(updated.land._id).populate('owner', 'mobile')
		if (land?.owner?.mobile) {
			const to = land.owner.mobile
			const landName = land.title

			if (req.body.isStart === true && !prevOngoing) {
				await sendTemplatedSMS({ to, key: 'irrigation_start', variables: { landName, time: updated.startedAt.toLocaleTimeString('fa-IR') } })
			}
			if ((req.body.isEnd === true || req.body.endTime) && prevOngoing && updated.duration) {
				await sendTemplatedSMS({ to, key: 'irrigation_end', variables: { landName, duration: updated.duration } })
			}
		}

		return res.status(200).json({ message: 'آبیاری با موفقیت ویرایش شد.', irrigation: updated })
	} catch (err) {
		console.error(err)
		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations.irrigations[field] || field
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
		const deleted = await Irrigation.findByIdAndDelete(irrigationId)
		if (!deleted) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })
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
