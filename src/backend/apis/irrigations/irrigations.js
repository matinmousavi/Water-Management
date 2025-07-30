import { Router } from 'express'
import mongoose from '../../config/database.js'
import Irrigation from '../../models/Irrigation.model.js'
import { sendTemplatedSMS } from '../../utils/sendTemplatedSMS.js'
import dayjs from 'dayjs'
import { fieldTranslations } from '../../constants/fieldTranslations.js'
import { sanitizeQuery } from '../../utils/sanitizeQuery.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'

const router = Router()

const mergeDateTime = (dateStr, timeStr) => {
	const date = dayjs(dateStr)
	const time = dayjs(timeStr)

	const combined = date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0)

	return new Date(combined.format())
}

// GET all irrigations
router.get('/', async (req, res) => {
	try {
		const safeQuery = sanitizeQuery(req.query)
		const filter = {}
		const allowedFilters = ['land', 'well', 'createdBy', 'landGroup']

		allowedFilters.forEach(field => {
			if (safeQuery[field]) {
				filter[field] = safeQuery[field]
			}
		})

		const irrigations = await Irrigation.find(filter)
			.populate('land', 'title')
			.populate('well', 'title')
			.populate('createdBy', 'fullName mobile')
			.sort({ createdAt: -1 })
			.lean()

		if (safeQuery.grouped === 'true') {
			const grouped = Object.values(
				irrigations.reduce((acc, log) => {
					if (log.landGroup) {
						const key = `${log.landGroup}_${log.well._id}`
						if (!acc[key]) {
							acc[key] = {
								landGroup: log.landGroup,
								well: log.well,
								createdBy: log.createdBy,
								startedAt: log.startedAt,
								endedAt: log.endedAt,
								duration: log.duration,
								note: log.note,
								isOngoing: log.isOngoing,
								createdAt: log.createdAt,
								updatedAt: log.updatedAt,
								lands: [log.land],
							}
						} else {
							acc[key].lands.push(log.land)

							acc[key].startedAt = acc[key].startedAt || log.startedAt
							acc[key].endedAt = acc[key].endedAt || log.endedAt
							acc[key].isOngoing = acc[key].isOngoing || log.isOngoing
							acc[key].duration = acc[key].duration || log.duration
							acc[key].note = acc[key].note || log.note
						}
					} else {
						const key = log._id.toString()
						acc[key] = log
					}
					return acc
				}, {})
			)

			return res.status(200).json({ irrigations: grouped })
		}

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
			.populate('createdBy', 'fullName mobile')
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
		const { landId, wellId, landGroupId, startDate, startTime, endDate, endTime, note } = req.body
		let { isOngoing } = req.body
		const userId = req.user._id
		const now = new Date()

		let startedAt, endedAt

		if (startDate && startTime) startedAt = mergeDateTime(startDate, startTime)
		else if (startTime) startedAt = mergeDateTime(now, startTime)

		if (endDate && endTime) {
			endedAt = mergeDateTime(endDate, endTime)
			isOngoing = false
		} else {
			endedAt = null
		}

		if (landGroupId) {
			const well = await Well.findById(wellId)
			if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

			const group = well.landGroups.find(group => group.groupId.toString() === landGroupId)
			if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

			const activeIrrigation = await Irrigation.findOne({
				land: { $in: group.lands },
				well: wellId,
				isOngoing: true,
				endedAt: null,
			})
			if (activeIrrigation) {
				return res.status(400).json({ message: 'یک یا چند زمین این گروه در حال آبیاری هستند.' })
			}

			const irrigationLogs = []
			for (const land of group.lands) {
				const created = await Irrigation.create({
					land,
					well: wellId,
					startedAt,
					endedAt,
					note,
					isOngoing,
					createdBy: userId,
					landGroup: landGroupId,
				})
				irrigationLogs.push(created)

				const landDoc = await Land.findById(land).populate('owner', 'fullName mobile')
				if (landDoc.notificationsEnabled && landDoc.owner?.mobile) {
					await sendTemplatedSMS({
						to: landDoc.owner.mobile,
						key: endedAt ? 'irrigation_end_irrigator' : 'irrigation_start_irrigator',
						variables: {
							land_title: landDoc.title,
							start_time: startedAt?.toLocaleTimeString('fa-IR'),
							duration: created.duration,
						},
					})
				}
			}

			return res.status(201).json({
				message: 'آبیاری گروهی با موفقیت ثبت شد.',
				irrigations: irrigationLogs,
			})
		}

		const existing = await Irrigation.findOne({
			land: landId,
			well: wellId,
			isOngoing: true,
			endedAt: null,
		})
		if (existing) {
			return res.status(400).json({
				message: 'این زمین هم‌اکنون در حال آبیاری با این چاه است و هنوز پایان نیافته.',
			})
		}

		const created = await Irrigation.create({
			land: landId,
			well: wellId,
			startedAt,
			endedAt,
			note,
			isOngoing,
			createdBy: userId,
		})

		const irrigation = await Irrigation.findById(created._id)
			.populate({
				path: 'land',
				populate: { path: 'owner', select: 'fullName mobile' },
				select: 'title owner',
			})
			.populate('well', 'title')
			.populate('createdBy', 'fullName mobile')

		const land = irrigation.land
		if (land?.owner?.mobile && land.notificationsEnabled) {
			await sendTemplatedSMS({
				to: land.owner.mobile,
				key: endedAt ? 'irrigation_end_irrigator' : 'irrigation_start_irrigator',
				variables: {
					land_title: land.title,
					start_time: startedAt?.toLocaleTimeString('fa-IR'),
					duration: irrigation.duration,
				},
			})
		}

		return res.status(201).json({
			message: 'آبیاری با موفقیت ثبت شد.',
			irrigation,
		})
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
		if (!irrigation) {
			return res.status(404).json({ message: 'آبیاری پیدا نشد.' })
		}

		const now = new Date()
		const { startDate, startTime, endDate, endTime, ...otherFields } = req.body

		if (irrigation.landGroup) {
			const groupIrrigations = await Irrigation.find({
				well: irrigation.well,
				landGroup: irrigation.landGroup,
				isOngoing: true,
			})

			for (const irrigation of groupIrrigations) {
				if (startDate && startTime) {
					irrigation.startedAt = mergeDateTime(startDate, startTime)
				} else if (startTime) {
					irrigation.startedAt = mergeDateTime(now, startTime)
				}

				if (endDate && endTime) {
					irrigation.endedAt = mergeDateTime(endDate, endTime)
					irrigation.isOngoing = false
				} else if (endTime) {
					irrigation.endedAt = mergeDateTime(now, endTime)
					irrigation.isOngoing = false
				}

				Object.entries(otherFields).forEach(([key, val]) => {
					irrigation[key] = val
				})

				await irrigation.save()

				const landDoc = await Land.findById(irrigation.land).populate('owner', 'fullName mobile')
				if (landDoc.notificationsEnabled && landDoc.owner?.mobile) {
					if ((startDate && startTime) || startDate || startTime) {
						await sendTemplatedSMS({
							to: landDoc.owner.mobile,
							key: 'irrigation_start_irrigator',
							variables: {
								land_title: landDoc.title,
								start_time: irrigation.startedAt.toLocaleTimeString('fa-IR'),
							},
						})
					}
					if (((endDate && endTime) || endDate || endTime) && irrigation.duration) {
						await sendTemplatedSMS({
							to: landDoc.owner.mobile,
							key: 'irrigation_end_irrigator',
							variables: {
								land_title: landDoc.title,
								duration: irrigation.duration,
								well_irrigator: req.user?.fullName || '',
								well_title: (await Well.findById(irrigation.well)).title,
								end_time: irrigation.endedAt.toLocaleTimeString('fa-IR'),
							},
						})
					}
				}
			}

			const updatedGroup = await Irrigation.find({
				well: irrigation.well,
				landGroup: irrigation.landGroup,
			})
				.populate({ path: 'land', populate: { path: 'owner', select: 'fullName mobile' }, select: 'title owner' })
				.populate('well', 'title')
				.populate('createdBy', 'fullName mobile')

			return res.status(200).json({
				message: 'آبیاری گروهی با موفقیت ویرایش شد.',
				irrigations: updatedGroup,
			})
		}

		if (startDate && startTime) {
			irrigation.startedAt = mergeDateTime(startDate, startTime)
		} else if (startTime) {
			irrigation.startedAt = mergeDateTime(now, startTime)
		}

		if (endDate && endTime) {
			irrigation.endedAt = mergeDateTime(endDate, endTime)
			irrigation.isOngoing = false
		} else if (endTime) {
			irrigation.endedAt = mergeDateTime(now, endTime)
			irrigation.isOngoing = false
		}

		Object.entries(otherFields).forEach(([key, val]) => {
			irrigation[key] = val
		})

		await irrigation.save()

		const updated = await Irrigation.findById(irrigationId)
			.populate({ path: 'land', populate: { path: 'owner', select: 'fullName mobile' }, select: 'title owner' })
			.populate('well', 'title')
			.populate('createdBy', 'fullName mobile')

		const land = updated.land
		if (land?.owner?.mobile && land.notificationsEnabled) {
			const to = land.owner.mobile
			const landName = land.title

			if ((startDate && startTime) || startDate || startTime) {
				await sendTemplatedSMS({
					to,
					key: 'irrigation_start_irrigator',
					variables: { land_title: landName, start_time: updated.startedAt.toLocaleTimeString('fa-IR') },
				})
			}
			if (((endDate && endTime) || endDate || endTime) && updated.duration) {
				await sendTemplatedSMS({
					to,
					key: 'irrigation_end_irrigator',
					variables: {
						land_title: landName,
						duration: updated.duration,
						well_irrigator: updated.fullName || '',
						well_title: updated.well.title,
						end_time: updated.endedAt.toLocaleTimeString('fa-IR'),
					},
				})
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
