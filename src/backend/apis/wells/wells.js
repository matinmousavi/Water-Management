import { Router } from 'express'
import Well from '../../models/Well.model.js'
import Irrigation from '../../models/Irrigation.model.js'
import { fieldTranslations } from '../../constants/fieldTranslations.js'
import { sanitizeQuery } from '../../utils/sanitizeQuery.js'

const router = Router()

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
				populate: {
					path: 'owner',
					select: 'firstName lastName mobile',
				},
			})
			.populate({
				path: 'irrigator',
				select: 'firstName lastName mobile',
			})
			.lean()

		wells = await Promise.all(
			wells.map(async well => {
				const logs = await Irrigation.find({ well: well._id })
					.populate('land')
					.populate('createdBy', 'firstName lastName')
					.sort({ createdAt: -1 })
					.lean()
				well.logs = logs

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
				populate: {
					path: 'owner',
					select: 'firstName lastName mobile',
				},
			})
			.populate({
				path: 'irrigator',
				select: 'firstName lastName mobile',
			})
			.lean()

		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		const logs = await Irrigation.find({ well: wellId })
			.populate({
				path: 'land',
				populate: {
					path: 'owner',
					select: 'firstName lastName mobile',
				},
				select: 'title owner area location',
			})
			.populate('createdBy', 'firstName lastName')
			.sort({ createdAt: -1 })
			.lean()

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

		return res.status(200).json({ well: { ...well, logs } })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// POST create well
router.post('/', async (req, res) => {
	try {
		const { title, licenseCode, cycleDays, location, irrigator, lands } = req.body
		let newWell = await Well.create({ title, licenseCode, cycleDays, location, irrigator, lands })

		newWell = await newWell.populate('irrigator')

		return res.status(201).json({
			message: 'چاه با موفقیت ایجاد شد.',
			well: newWell,
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
			const field = firstError.path
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
		const updates = req.body

		const well = await Well.findById(wellId)
		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		Object.assign(well, updates)
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

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
