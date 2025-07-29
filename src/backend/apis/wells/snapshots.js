import { Router } from 'express'
import Schedule from '../../models/scheduleSchema.model.js'
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

// POST create snapshot with title and schedules (include title)
router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { title, description } = req.body

		if (!title) {
			return res.status(400).json({ message: 'عنوان اسنپ‌شات الزامی است.' })
		}

		const schedules = await Schedule.find({ well: wellId }).lean()

		const snapshot = await ScheduleSnapshot.create({
			well: wellId,
			title,
			description,
			schedules: schedules.map(schedule => ({
				targetType: schedule.targetType,
				land: schedule.land,
				landGroup: schedule.landGroup,
				startTime: schedule.startTime,
				endTime: schedule.endTime,
				title: schedule.title,
			})),
		})

		return res.status(201).json({ message: 'اسنپ‌شات ذخیره شد.', snapshot })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد اسنپ‌شات.' })
	}
})

// POST restore schedules from snapshot
router.post('/:snapshotId/restore', async (req, res) => {
	try {
		const { wellId, snapshotId } = req.params
		const snapshot = await ScheduleSnapshot.findById(snapshotId)
		if (!snapshot) return res.status(404).json({ message: 'اسنپ‌شات پیدا نشد.' })

		await Schedule.deleteMany({ well: wellId })

		await Schedule.insertMany(
			snapshot.schedules.map(schedule => ({
				well: wellId,
				targetType: schedule.targetType,
				land: schedule.land,
				landGroup: schedule.landGroup,
				startTime: schedule.startTime,
				endTime: schedule.endTime,
				title: schedule.title,
				status: 'active',
			}))
		)

		return res.status(200).json({ message: 'زمان‌بندی‌ها با موفقیت بازگردانی شدند.' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در بازگردانی اسنپ‌شات.' })
	}
})

export default router
