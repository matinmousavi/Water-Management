import { Router } from 'express'
import Schedule from '../../models/Schedule.model.js'
import ScheduleSnapshot from '../../models/ScheduleSnapshot.model.js'

const router = Router({ mergeParams: true })

// GET all snapshots for a well
router.get('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const snapshots = await ScheduleSnapshot.find({ well: wellId }).lean()
		return res.status(200).json({ snapshots })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت اسنپ‌شات‌ها.' })
	}
})

// POST create snapshot
router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { title, description } = req.body

		if (!title?.trim()) {
			return res.status(400).json({ message: 'عنوان اسنپ‌شات الزامی است.' })
		}

		const schedules = await Schedule.find({ well: wellId }).lean()
		if (!schedules.length) {
			return res.status(400).json({ message: 'هیچ زمان‌بندی فعالی برای ذخیره وجود ندارد.' })
		}

		const snapshot = await ScheduleSnapshot.create({
			well: wellId,
			title,
			description,
			schedules: schedules.map(s => ({
				targetType: s.targetType,
				land: s.land,
				landGroup: s.landGroup,
				startTime: s.startTime.toISOString(),
				endTime: s.endTime.toISOString(),
				title: s.title,
				day: s.day,
				color: s.color || null,
			})),
		})

		return res.status(201).json({ message: 'اسنپ‌شات ذخیره شد.', snapshot })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد اسنپ‌شات.' })
	}
})

// POST restore snapshot
router.post('/:snapshotId/restore', async (req, res) => {
	try {
		const { wellId, snapshotId } = req.params
		const snapshot = await ScheduleSnapshot.findById(snapshotId)
		if (!snapshot) {
			return res.status(404).json({ message: 'اسنپ‌شات پیدا نشد.' })
		}

		await Schedule.deleteMany({ well: wellId })

		const schedulesToInsert = snapshot.schedules.map(s => ({
			well: wellId,
			targetType: s.targetType,
			land: s.land,
			landGroup: s.landGroup,
			startTime: new Date(s.startTime),
			endTime: new Date(s.endTime),
			title: s.title,
			color: s.color,
			day: s.day,
			status: 'active',
		}))

		await Schedule.insertMany(schedulesToInsert)

		return res.status(200).json({ message: 'زمان‌بندی‌ها با موفقیت بازگردانی شدند.' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در بازگردانی اسنپ‌شات.' })
	}
})

export default router
