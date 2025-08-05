import { Router } from 'express'
import Schedule from '../../models/Schedule.model.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'

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

// POST create a new schedule
router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { targetType, targetId, startTime, endTime, day, color } = req.body

		let title = ''
		let land = null
		let landGroup = null

		if (targetType === 'land' && targetId) {
			const landDoc = await Land.findById(targetId).lean()
			if (!landDoc) return res.status(404).json({ message: 'زمین پیدا نشد.' })
			title = landDoc.title
			land = targetId
		} else if (targetType === 'group' && targetId) {
			const well = await Well.findById(wellId).lean()
			if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

			const group = well.landGroups.find(g => g.groupId.toString() === targetId)
			if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

			title = group.title
			landGroup = targetId
		} else {
			return res.status(400).json({ message: 'اطلاعات زمین یا گروه نامعتبر است.' })
		}

		const schedule = await Schedule.create({
			well: wellId,
			targetType,
			land,
			landGroup,
			startTime,
			endTime,
			title,
			day,
			color,
			status: 'active',
		})

		return res.status(201).json({ message: 'زمان‌بندی ایجاد شد.', schedule })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد زمان‌بندی.' })
	}
})

// PATCH update schedule
router.patch('/:scheduleId', async (req, res) => {
	try {
		const { scheduleId, wellId } = req.params
		const { targetType, targetId, startTime, endTime, day, color } = req.body

		let title = ''
		let land = null
		let landGroup = null

		if (targetType === 'land' && targetId) {
			const landDoc = await Land.findById(targetId).lean()
			if (!landDoc) return res.status(404).json({ message: 'زمین پیدا نشد.' })
			title = landDoc.title
			land = targetId
		} else if (targetType === 'group' && targetId) {
			const well = await Well.findById(wellId).lean()
			if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

			const group = well.landGroups.find(g => g.groupId.toString() === targetId)
			if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

			title = group.title
			landGroup = targetId
		} else {
			return res.status(400).json({ message: 'اطلاعات زمین یا گروه نامعتبر است.' })
		}

		const updates = {
			targetType,
			land,
			landGroup,
			startTime,
			endTime,
			title,
			day,
			color,
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
