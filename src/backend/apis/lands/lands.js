import { Router } from 'express'
import mongoose from '../../config/database.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import Irrigation from '../../models/Irrigation.model.js'
import Note from '../../models/Note.model.js'
import Schedule from '../../models/Schedule.model.js'

import { fieldTranslations } from '../../constants/fieldTranslations.js'
import { sanitizeQuery } from '../../utils/sanitizeQuery.js'

const router = Router()

async function attachWells(land) {
	const wells = await Well.find({ lands: land._id }).select('_id title licenseCode cycleDays irrigator').populate('irrigator', '_id fullName mobile').lean()
	return { ...land, wells }
}

// GET all lands with optional filters
router.get('/', async (req, res) => {
	try {
		const safeQuery = sanitizeQuery(req.query)
		const filter = {}
		const allowedFields = ['title', 'owner', 'status', 'irrigationType', 'cropType', 'location']

		allowedFields.forEach(field => {
			if (safeQuery[field]) {
				if (field === 'owner') {
					filter[field] = safeQuery[field]
				} else {
					filter[field] = { $regex: safeQuery[field], $options: 'i' }
				}
			}
		})

		const lands = await Land.find(filter).populate('owner').lean()
		const landsWithWells = await Promise.all(lands.map(attachWells))
		return res.status(200).json({ lands: landsWithWells })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در دریافت اطلاعات زمین‌ها!' })
	}
})

// GET land by ID
router.get('/:landId', async (req, res) => {
	try {
		const { landId } = req.params

		if (!mongoose.isValidObjectId(landId)) {
			return res.status(400).json({ message: 'شناسه زمین معتبر نیست.' })
		}

		const land = await Land.findById(landId).populate('owner').lean()
		if (!land) {
			return res.status(404).json({ message: 'زمین پیدا نشد.' })
		}

		const landWithWells = await attachWells(land)
		const wellIds = landWithWells.wells?.map(well => well._id) || []

		const ongoingIrrigations = await Irrigation.find({
			well: { $in: wellIds },
			isOngoing: true,
		})
			.select('well land startedAt')
			.populate('land', '_id title')

		const ongoingMap = new Map()
		for (const irrigation of ongoingIrrigations) {
			ongoingMap.set(irrigation.well.toString(), {
				land: irrigation.land,
				startedAt: irrigation.startedAt,
				irrigationId: irrigation._id,
			})
		}

		const wellsWithStatus =
			landWithWells.wells?.map(well => {
				const irrigationInfo = ongoingMap.get(well._id.toString())
				return {
					...well,
					isIrrigating: !!irrigationInfo,
					irrigatingLand: irrigationInfo
						? {
								_id: irrigationInfo.land._id,
								title: irrigationInfo.land.title,
						  }
						: null,
					irrigationStartedAt: irrigationInfo?.startedAt || null,
					ongoingIrrigationId: irrigationInfo?.irrigationId || null,
				}
			}) || []

		// --- اضافه کردن مقادیر آب و چرخه ---
		const wellsWithWaterData = await Promise.all(
			wellsWithStatus.map(async well => {
				if (!well._id) return well

				// پیدا کردن تمام زمانبندی‌ها برای این چاه
				const schedules = await Schedule.find({ well: well._id, land: land._id }).lean()
				const totalSchedulesInCycle = schedules.length

				const totalRequiredMs = schedules.reduce((sum, s) => {
					const start = new Date(s.startTime)
					const end = new Date(s.endTime)
					return sum + (end - start)
				}, 0)

				const irrigations = await Irrigation.find({ well: well._id, land: land._id }).lean()
				const receivedMs = irrigations.reduce((sum, log) => {
					if (!log.endedAt) return sum
					return sum + (new Date(log.endedAt) - new Date(log.startedAt))
				}, 0)

				const nextIrrigationLog = await Irrigation.find({ well: well._id, land: land._id, endedAt: null }).sort({ startedAt: 1 }).lean()

				const nextIrrigation = nextIrrigationLog[0]?.startedAt || null

				return {
					...well,
					requiredWater: `${Math.floor(totalRequiredMs / 3600000)}:${Math.floor((totalRequiredMs % 3600000) / 60000)
						.toString()
						.padStart(2, '0')}`,
					receivedWater: `${Math.floor(receivedMs / 3600000)}:${Math.floor((receivedMs % 3600000) / 60000)
						.toString()
						.padStart(2, '0')}`,
					remainingWater: `${Math.max(0, Math.floor((totalRequiredMs - receivedMs) / 3600000))}:${Math.max(
						0,
						Math.floor(((totalRequiredMs - receivedMs) % 3600000) / 60000)
					)
						.toString()
						.padStart(2, '0')}`,
					nextIrrigation,
					totalSchedulesInCycle,
					receivedWaterInCycle: `${Math.floor(receivedMs / 3600000)}:${Math.floor((receivedMs % 3600000) / 60000)
						.toString()
						.padStart(2, '0')}`,
				}
			})
		)

		const logs = await Irrigation.find({ land: land._id }).sort({ date: -1 }).lean()
		const notes = await Note.find({ reference: land._id, type: 'land' }).populate('user', '_id fullName').lean()

		return res.status(200).json({
			land: {
				...landWithWells,
				wells: wellsWithWaterData,
				logs,
				notes,
			},
		})
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// POST create new land
router.post('/', async (req, res) => {
	try {
		const { title, owner, area, kFactor, location, irrigationType, cropType, note, wellId } = req.body
		const userId = req.user._id

		const newLand = await Land.create({ title, owner, area, kFactor, location, irrigationType, cropType })

		if (note) {
			await Note.create({ user: userId, text: note, type: 'land', reference: newLand._id, typeRef: 'Land' })
		}

		if (wellId) {
			const well = await Well.findById(wellId)
			if (!well) return res.status(404).json({ message: 'چاه مورد نظر یافت نشد.' })
			well.lands.push(newLand._id)
			await well.save()
		}

		const populatedLand = await Land.findById(newLand._id).populate('owner').lean()
		const landWithWells = await attachWells(populatedLand)
		return res.status(201).json({ message: 'زمین با موفقیت ایجاد شد.', land: landWithWells })
	} catch (err) {
		console.error(err.message)
		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations.lands[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}
		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations.lands[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی است.` })
		}
		return res.status(500).json({ message: 'خطا در ایجاد زمین.' })
	}
})

// PATCH update land
router.patch('/:landId', async (req, res) => {
	try {
		const { landId } = req.params
		const updates = { ...req.body }
		const { wellId } = updates

		const land = await Land.findById(landId)
		if (!land) return res.status(404).json({ message: 'زمین پیدا نشد.' })

		if (wellId) {
			await Well.updateMany({ lands: land._id }, { $pull: { lands: land._id } })
			const well = await Well.findById(wellId)
			if (!well) return res.status(404).json({ message: 'چاه مورد نظر یافت نشد.' })
			if (!well.lands.includes(land._id)) {
				well.lands.push(land._id)
				await well.save()
			}
		}

		delete updates.wellId
		Object.assign(land, updates)
		await land.save()

		const populatedLand = await Land.findById(landId).populate('owner').lean()
		const updated = await attachWells(populatedLand)
		return res.status(200).json({ message: 'زمین با موفقیت ویرایش شد.', land: updated })
	} catch (err) {
		console.error(err.message)
		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations.lands[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}
		return res.status(500).json({ message: 'خطا در ویرایش زمین.' })
	}
})

// DELETE land
router.delete('/:landId', async (req, res) => {
	try {
		const { landId } = req.params
		const land = await Land.findByIdAndDelete(landId)
		if (!land) return res.status(404).json({ message: 'زمین پیدا نشد.' })
		await Note.deleteMany({ reference: landId, type: 'land' })
		return res.status(200).json({ message: 'زمین با موفقیت حذف شد.' })
	} catch (err) {
		console.error('خطا در حذف زمین:', err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// POST add note to land
router.post('/:landId/notes', async (req, res) => {
	try {
		const { landId } = req.params
		const { text } = req.body
		const userId = req.user._id

		const land = await Land.findById(landId)
		if (!land) return res.status(404).json({ message: 'زمین پیدا نشد.' })

		const newNote = await Note.create({ user: userId, text, type: 'land', reference: landId, typeRef: 'Land' })
		await newNote.populate('user', '_id fullName')

		return res.status(200).json({ message: 'یادداشت با موفقیت اضافه شد.', note: newNote })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در افزودن یادداشت.' })
	}
})

// PUT update a specific note
router.put('/:landId/notes/:noteId', async (req, res) => {
	try {
		const { landId, noteId } = req.params
		const { text } = req.body
		const userId = req.user._id
		const isAdmin = req.isAdmin

		const note = await Note.findById(noteId)
		if (!note || note.reference.toString() !== landId) return res.status(404).json({ message: 'یادداشت پیدا نشد.' })

		if (!note.user.equals(userId) && !isAdmin) {
			return res.status(403).json({ message: 'دسترسی غیرمجاز به یادداشت.' })
		}

		note.text = text
		await note.save()
		await note.populate('user', '_id fullName')
		return res.status(200).json({ message: 'یادداشت به‌روزرسانی شد.', note })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در ویرایش یادداشت.' })
	}
})

// DELETE specific note from land
router.delete('/:landId/notes/:noteId', async (req, res) => {
	try {
		const { landId, noteId } = req.params
		const userId = req.user._id
		const isAdmin = req.isAdmin

		const note = await Note.findById(noteId)
		if (!note || note.reference.toString() !== landId) return res.status(404).json({ message: 'یادداشت پیدا نشد.' })

		if (!note.user.equals(userId) && !isAdmin) {
			return res.status(403).json({ message: 'شما اجازه حذف این یادداشت را ندارید.' })
		}

		await note.deleteOne()
		return res.status(200).json({ message: 'یادداشت با موفقیت حذف شد.' })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در حذف یادداشت.' })
	}
})

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
