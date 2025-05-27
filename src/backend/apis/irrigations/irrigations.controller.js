import mongoose from '../../config/database.js'
import Irrigation from '../../models/Irrigation.js'

const fieldTranslations = {
	land: 'زمین',
	well: 'چاه',
	startTime: 'زمان شروع',
	endTime: 'زمان پایان',
	durationMinutes: 'مدت زمان',
	createdBy: 'ثبت‌کننده',
}

export const getIrrigations = async (req, res) => {
	try {
		const filter = {}

		const allowedFilters = ['land', 'well', 'createdBy']
		allowedFilters.forEach(field => {
			if (req.query[field]) {
				filter[field] = req.query[field]
			}
		})

		const irrigations = await Irrigation.find(filter)
			.populate('land', 'name')
			.populate('well', 'title')
			.populate('createdBy', 'name')
			.sort({ createdAt: -1 })
			.lean()

		return res.status(200).json({ irrigations })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در دریافت لاگ‌های آبیاری!' })
	}
}

export const getIrrigation = async (req, res) => {
	try {
		const { irrigationId } = req.params

		const irrigation = await Irrigation.findById(irrigationId).populate('land', 'name').populate('well', 'title').populate('createdBy', 'name').lean()

		if (!irrigation) {
			return res.status(404).json({ message: 'آبیاری پیدا نشد.' })
		}

		return res.status(200).json({ irrigation })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
}

export const createIrrigation = async (req, res) => {
	try {
		const { land, well, startTime, endTime, durationMinutes, notes, createdBy } = req.body

		const irrigation = await Irrigation.create({ land, well, startTime, endTime, durationMinutes, notes, createdBy })

		return res.status(201).json({
			message: 'آبیاری با موفقیت ثبت شد.',
			irrigation,
		})
	} catch (err) {
		console.error(err.message)

		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی یا نامعتبر است.` })
		}

		return res.status(500).json({ message: 'خطا در ثبت آبیاری.' })
	}
}

export const updateIrrigation = async (req, res) => {
	try {
		const { irrigationId } = req.params

		if (!mongoose.isValidObjectId(irrigationId)) {
			return res.status(400).json({ message: 'شناسه آبیاری معتبر نیست.' })
		}

		const irrigation = await Irrigation.findById(irrigationId)
		if (!irrigation) {
			return res.status(404).json({ message: 'آبیاری پیدا نشد.' })
		}

		Object.assign(irrigation, req.body)
		await irrigation.save()

		const updated = await Irrigation.findById(irrigationId).populate('land', 'name').populate('well', 'title').populate('createdBy', 'name')

		return res.status(200).json({
			message: 'آبیاری با موفقیت ویرایش شد.',
			irrigation: updated,
		})
	} catch (err) {
		console.error(err.message)

		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی یا نامعتبر است.` })
		}

		return res.status(500).json({ message: 'خطا در ویرایش آبیاری.' })
	}
}

export const deleteIrrigation = async (req, res) => {
	try {
		const { irrigationId } = req.params

		if (!mongoose.isValidObjectId(irrigationId)) {
			return res.status(400).json({ message: 'شناسه آبیاری معتبر نیست.' })
		}

		const deleted = await Irrigation.findByIdAndDelete(irrigationId)

		if (!deleted) {
			return res.status(404).json({ message: 'آبیاری پیدا نشد.' })
		}

		return res.status(200).json({ message: 'آبیاری با موفقیت حذف شد.' })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
}
