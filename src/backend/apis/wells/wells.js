import { Router } from 'express'
import Well from '../../models/Well.model.js'
import Note from '../../models/Note.model.js'
import Irrigation from '../../models/Irrigation.model.js'
import { fieldTranslations } from '../../constants/fieldTranslations.js'
import { sanitizeQuery } from '../../utils/sanitizeQuery.js'
import landGroupsRouter from './landGroups.js'
import schedulesRouter from './schedules.js'
import snapshotsRouter from './snapshots.js'

const router = Router()

// Helper: Attach populated landGroup
const getLandGroupTitle = (landGroupId, well) => {
	if (!landGroupId || !well || !well.landGroups) return null
	const group = well.landGroups.find(g => g.groupId.toString() === landGroupId.toString())
	return group ? group.title : null
}

// GET all wells
router.get('/', async (req, res) => {
	try {
		const filter = {}
		const safeQuery = sanitizeQuery(req.query)
		const allowedFields = ['title', 'licenseCode', 'irrigator']
		allowedFields.forEach(field => {
			if (safeQuery[field]) {
				if (field === 'irrigator') {
					filter[field] = safeQuery[field]
				} else {
					filter[field] = { $regex: `^${safeQuery[field]}$`, $options: 'i' }
				}
			}
		})

		let wells = await Well.find(filter)
			.populate({
				path: 'lands',
				populate: { path: 'owner', select: 'fullName mobile' },
			})
			.populate({ path: 'irrigator', select: 'fullName mobile' })
			.lean()

		wells = await Promise.all(
			wells.map(async well => {
				const logs = await Irrigation.find({ well: well._id })
					.populate({
						path: 'land',
						populate: { path: 'owner', select: 'fullName mobile' },
						select: 'title owner area location',
					})
					.populate('createdBy', 'fullName')
					.sort({ createdAt: -1 })
					.lean()

				const logsWithGroups = logs.map(log => ({
					...log,
					landGroupTitle: getLandGroupTitle(log.landGroup, well),
				}))

				well.logs = logsWithGroups

				well.lands = await Promise.all(
					well.lands.map(async land => {
						const last = await Irrigation.findOne({
							well: well._id,
							land: land._id,
							endedAt: { $exists: true },
						})
							.sort({ endedAt: -1 })
							.select('endedAt')
							.lean()

						return {
							...land,
							lastIrrigatedAt: last ? last.endedAt : null,
						}
					})
				)

				const notes = await Note.find({ type: 'well', reference: well._id }).populate('user', 'fullName').lean()
				well.notes = notes

				return well
			})
		)

		return res.status(200).json({ wells })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در دریافت اطلاعات چاه‌ها!' })
	}
})

// GET single well
router.get('/:wellId', async (req, res) => {
	try {
		const { wellId } = req.params

		let well = await Well.findById(wellId)
			.populate({
				path: 'lands',
				populate: { path: 'owner', select: 'fullName mobile' },
			})
			.populate({ path: 'irrigator', select: 'fullName mobile' })
			.lean()

		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		let logs = await Irrigation.find({ well: wellId })
			.populate({
				path: 'land',
				populate: { path: 'owner', select: 'fullName mobile' },
				select: 'title owner area location',
			})
			.populate('createdBy', 'fullName')
			.sort({ createdAt: -1 })
			.lean()

		logs = logs.map(log => ({
			...log,
			landGroupTitle: getLandGroupTitle(log.landGroup, well),
		}))

		well.lands = await Promise.all(
			well.lands.map(async land => {
				const last = await Irrigation.findOne({
					well: wellId,
					land: land._id,
					endedAt: { $exists: true },
				})
					.sort({ endedAt: -1 })
					.select('endedAt')
					.lean()

				return {
					...land,
					lastIrrigatedAt: last ? last.endedAt : null,
				}
			})
		)

		const notes = await Note.find({ type: 'well', reference: wellId }).populate('user', 'fullName').lean()

		return res.status(200).json({ well: { ...well, logs, notes } })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// POST create well
router.post('/', async (req, res) => {
	try {
		let { title, licenseCode, cycleDays, cycleStartDate, location, irrigator, lands, workTime } = req.body

		// حذف زمین‌های تکراری
		if (Array.isArray(lands)) {
			lands = [...new Set(lands.map(id => id.toString()))]
		}

		let newWell = await Well.create({
			title,
			licenseCode,
			cycleDays,
			cycleStartDate,
			location,
			irrigator,
			lands,
			workTime,
			status: 'active',
		})

		newWell = await newWell.populate('irrigator', 'fullName')

		const representation = {
			_id: newWell._id,
			title: newWell.title,
			status: newWell.status,
			irrigator: newWell.irrigator ? { _id: newWell.irrigator._id, fullName: newWell.irrigator.fullName } : null,
			landsCount: Array.isArray(newWell.lands) ? newWell.lands.length : 0,
		}

		return res.status(201).json({
			message: 'چاه با موفقیت ایجاد شد.',
			well: representation,
		})
	} catch (err) {
		console.error(err.message)

		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations.wells[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path.includes('.') ? firstError.path.split('.')[1] : firstError.path
			const fieldName = fieldTranslations.wells[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی است.` })
		}

		return res.status(500).json({ message: 'خطا در ایجاد چاه.' })
	}
})

// PATCH update well
router.patch('/:wellId', async (req, res) => {
	try {
		const { wellId } = req.params
		const updates = { ...req.body }

		// حذف زمین‌های تکراری اگر ارسال شده
		if (updates.lands && Array.isArray(updates.lands)) {
			updates.lands = [...new Set(updates.lands.map(id => id.toString()))]
		}

		// تبدیل startTime و endTime به offTime
		if (updates.startTime && updates.endTime) {
			updates.offTime = {
				start: new Date(updates.startTime),
				end: new Date(updates.endTime),
			}
			delete updates.startTime
			delete updates.endTime
		}

		const well = await Well.findById(wellId)
		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		Object.assign(well, updates)
		await well.validate()
		await well.save()

		const updated = await Well.findById(wellId)
			.populate('irrigator')
			.populate({
				path: 'lands',
				populate: [{ path: 'owner' }],
			})

		return res.status(200).json({
			message: 'چاه با موفقیت ویرایش شد.',
			well: updated,
		})
	} catch (err) {
		console.error(err.message)

		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations.wells[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path.includes('.') ? firstError.path.split('.')[1] : firstError.path
			const fieldName = fieldTranslations.wells[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی است.` })
		}

		return res.status(500).json({ message: 'خطا در ویرایش چاه.' })
	}
})

// DELETE well
router.delete('/:wellId', async (req, res) => {
	try {
		const { wellId } = req.params
		const well = await Well.findByIdAndDelete(wellId)

		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		return res.status(200).json({ message: 'چاه با موفقیت حذف شد.' })
	} catch (err) {
		console.error('خطا در حذف چاه:', err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

router.use('/:wellId/land-groups', landGroupsRouter)
router.use('/:wellId/schedules', schedulesRouter)
router.use('/:wellId/snapshots', snapshotsRouter)

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
