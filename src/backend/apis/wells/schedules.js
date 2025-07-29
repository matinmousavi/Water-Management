import { Router } from 'express'
import Schedule from '../../models/scheduleSchema.model.js'

const router = Router({ mergeParams: true })

// GET all schedules for a well
router.get('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const schedules = await Schedule.find({ well: wellId }).populate('land', 'title').lean()

		return res.status(200).json({ schedules })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت زمان‌بندی‌ها.' })
	}
})

// POST create a new schedule with title
router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { targetType, land, landGroup, startTime, endTime, title } = req.body

		if (!title) {
			return res.status(400).json({ message: 'عنوان زمان‌بندی الزامی است.' })
		}

		const schedule = await Schedule.create({
			well: wellId,
			targetType,
			land,
			landGroup,
			startTime,
			endTime,
			title,
			status: 'active',
		})

		return res.status(201).json({ message: 'زمان‌بندی ایجاد شد.', schedule })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد زمان‌بندی.' })
	}
})

// PATCH update schedule with title support
router.patch('/:scheduleId', async (req, res) => {
	try {
		const { scheduleId } = req.params
		const updates = req.body

		if (updates.title && typeof updates.title !== 'string') {
			return res.status(400).json({ message: 'عنوان نامعتبر است.' })
		}

		const schedule = await Schedule.findByIdAndUpdate(scheduleId, updates, { new: true })
		if (!schedule) return res.status(404).json({ message: 'زمان‌بندی پیدا نشد.' })

		return res.status(200).json({ message: 'زمان‌بندی بروزرسانی شد.', schedule })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در بروزرسانی زمان‌بندی.' })
	}
})

// DELETE schedule
router.delete('/:scheduleId', async (req, res) => {
	try {
		const { scheduleId } = req.params
		const schedule = await Schedule.findByIdAndDelete(scheduleId)
		if (!schedule) return res.status(404).json({ message: 'زمان‌بندی پیدا نشد.' })

		return res.status(200).json({ message: 'زمان‌بندی حذف شد.' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در حذف زمان‌بندی.' })
	}
})

export default router
