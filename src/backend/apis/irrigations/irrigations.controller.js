import mongoose from '../../config/database.js'
import Irrigation from '../../models/Irrigation.model.js'
import Land from '../../models/Land.model.js'
import { sendTemplatedSMS } from '../../../utils/sendTemplatedSMS.js'

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
		let { land: landId, well: wellId, startTime, endTime, notes, isOngoing, isStart } = req.body
		const userId = req.user._id

		const now = new Date()

		if (isStart) {
			startTime = now
			endTime = null
		}

		const irrigation = await Irrigation.create({
			landId,
			wellId,
			startTime,
			endTime,
			notes,
			isOngoing,
			createdBy: userId,
		})

		const land = await Land.findById(land).populate('owner', 'mobile')
		if (land && land.owner && land.owner.mobile) {
			const to = land.owner.mobile
			const landName = land.name

			if (isStart) {
				await sendTemplatedSMS({
					to,
					key: 'irrigation_start',
					variables: {
						landName,
						time: now.toLocaleTimeString('fa-IR'),
					},
				})
			}

			if (!isOngoing && endTime) {
				const durationMs = new Date(endTime) - new Date(startTime)
				const durationMin = Math.round(durationMs / 60000)
				await sendTemplatedSMS({
					to,
					key: 'irrigation_end',
					variables: {
						landName,
						duration: durationMin,
					},
				})
			}
		}

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

		const prevOngoing = irrigation.isOngoing

		Object.assign(irrigation, req.body)
		await irrigation.save()

		const updated = await Irrigation.findById(irrigationId).populate('land', 'name').populate('well', 'title').populate('createdBy', 'firstName lastName')

		const land = await Land.findById(updated.land._id).populate('owner', 'mobile')
		if (land && land.owner && land.owner.mobile) {
			const to = land.owner.mobile
			const landName = land.name

			if (req.body.isOngoing === true && !prevOngoing) {
				const startTime = updated.startTime || new Date()
				await sendTemplatedSMS({
					to,
					key: 'irrigation_start',
					variables: {
						landName,
						time: startTime.toLocaleTimeString('fa-IR'),
					},
				})
			}

			if ((req.body.isOngoing === false || req.body.endTime) && prevOngoing) {
				const endTime = updated.endTime || new Date()
				const durationMs = new Date(endTime) - new Date(updated.startTime)
				const durationMin = Math.round(durationMs / 60000)
				await sendTemplatedSMS({
					to,
					key: 'irrigation_end',
					variables: {
						landName,
						duration: durationMin,
					},
				})
			}
		}

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
