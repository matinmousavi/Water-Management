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

const extractStartAndEndTimes = body => {
	const now = new Date()
	let startedAt,
		endedAt,
		isOngoing = body.isOngoing

	if (body.startDate && body.startTime) startedAt = mergeDateTime(body.startDate, body.startTime)
	else if (body.startTime) startedAt = mergeDateTime(now, body.startTime)

	if (body.endDate && body.endTime) {
		endedAt = mergeDateTime(body.endDate, body.endTime)
		isOngoing = false
	} else if (body.endTime) {
		endedAt = mergeDateTime(now, body.endTime)
		isOngoing = false
	}

	return { startedAt, endedAt, isOngoing }
}

const sendIrrigationNotificationToLandOwner = async ({ landId, irrigationDocument, endedAt, currentUser }) => {
	const landDocument = await Land.findById(landId).populate('owner', 'fullName mobile')
	if (!landDocument.notificationsEnabled || !landDocument.owner?.mobile) return

	const recipientMobile = landDocument.owner.mobile
	const landTitle = landDocument.title

	if (!endedAt) {
		await sendTemplatedSMS({
			to: recipientMobile,
			key: 'irrigation_start_irrigator',
			variables: { land_title: landTitle, start_time: irrigationDocument.startedAt.toLocaleTimeString('fa-IR') },
		})
	} else if (irrigationDocument.duration) {
		const wellDocument = await Well.findById(irrigationDocument.well)
		await sendTemplatedSMS({
			to: recipientMobile,
			key: 'irrigation_end_irrigator',
			variables: {
				land_title: landTitle,
				duration: irrigationDocument.duration,
				well_irrigator: currentUser?.fullName || '',
				well_title: wellDocument.title,
				end_time: irrigationDocument.endedAt.toLocaleTimeString('fa-IR'),
			},
		})
	}
}

const updateGroupIrrigationLogs = async ({ groupIrrigationDocuments, requestBody, currentUser }) => {
	const { startedAt, endedAt, isOngoing } = extractStartAndEndTimes(requestBody)

	for (const irrigationDocument of groupIrrigationDocuments) {
		if (startedAt) irrigationDocument.startedAt = startedAt
		if (endedAt) irrigationDocument.endedAt = endedAt

		Object.entries(requestBody).forEach(([fieldName, fieldValue]) => {
			if (!['startDate', 'startTime', 'endDate', 'endTime', 'createdBy'].includes(fieldName)) {
				irrigationDocument[fieldName] = fieldValue
			}
		})

		irrigationDocument.isOngoing = isOngoing
		irrigationDocument.createdBy = currentUser._id

		await irrigationDocument.save()
		await sendIrrigationNotificationToLandOwner({ landId: irrigationDocument.land, irrigationDocument, endedAt, currentUser })
	}

	return Irrigation.find({
		well: groupIrrigationDocuments[0].well,
		landGroup: groupIrrigationDocuments[0].landGroup,
	})
		.populate({ path: 'land', populate: { path: 'owner', select: 'fullName mobile' }, select: 'title owner' })
		.populate('well', 'title')
		.populate('createdBy', 'fullName mobile')
}

// GET all irrigations
router.get('/', async (req, res) => {
	try {
		const safeQuery = sanitizeQuery(req.query)
		const filter = {}
		const allowedFilters = ['land', 'well', 'createdBy', 'landGroup']

		allowedFilters.forEach(field => {
			if (safeQuery[field]) filter[field] = safeQuery[field]
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
							acc[key] = { ...log, lands: [log.land] }
						} else {
							acc[key].lands.push(log.land)
						}
					} else {
						acc[log._id.toString()] = log
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
		const { landId, wellId, landGroupId, note } = req.body
		const currentUser = req.user
		const { startedAt, endedAt, isOngoing } = extractStartAndEndTimes(req.body)

		if (landGroupId) {
			const wellDocument = await Well.findById(wellId)
			if (!wellDocument) return res.status(404).json({ message: 'چاه پیدا نشد.' })

			const groupDocument = wellDocument.landGroups.find(group => group.groupId.toString() === landGroupId)
			if (!groupDocument) return res.status(404).json({ message: 'گروه پیدا نشد.' })

			const activeIrrigation = await Irrigation.findOne({
				land: { $in: groupDocument.lands },
				well: wellId,
				isOngoing: true,
				endedAt: null,
			})
			if (activeIrrigation) return res.status(400).json({ message: 'یک یا چند زمین این گروه در حال آبیاری هستند.' })

			const createdIrrigationLogs = []
			for (const land of groupDocument.lands) {
				const createdIrrigation = await Irrigation.create({
					land,
					well: wellId,
					startedAt,
					endedAt,
					note,
					isOngoing,
					createdBy: currentUser._id,
					landGroup: landGroupId,
				})
				createdIrrigationLogs.push(createdIrrigation)

				await sendIrrigationNotificationToLandOwner({ landId: land, irrigationDocument: createdIrrigation, endedAt, currentUser })
			}

			return res.status(201).json({ message: 'آبیاری گروهی با موفقیت ثبت شد.', irrigations: createdIrrigationLogs })
		}

		const existingIrrigation = await Irrigation.findOne({
			land: landId,
			well: wellId,
			isOngoing: true,
			endedAt: null,
		})
		if (existingIrrigation) {
			return res.status(400).json({ message: 'این زمین هم‌اکنون در حال آبیاری با این چاه است.' })
		}

		const createdIrrigation = await Irrigation.create({
			land: landId,
			well: wellId,
			startedAt,
			endedAt,
			note,
			isOngoing,
			createdBy: currentUser._id,
		})

		const irrigationDocument = await Irrigation.findById(createdIrrigation._id)
			.populate({ path: 'land', populate: { path: 'owner', select: 'fullName mobile' }, select: 'title owner' })
			.populate('well', 'title')
			.populate('createdBy', 'fullName mobile')

		await sendIrrigationNotificationToLandOwner({
			landId: irrigationDocument.land._id,
			irrigationDocument,
			endedAt,
			currentUser,
		})

		return res.status(201).json({ message: 'آبیاری با موفقیت ثبت شد.', irrigation: irrigationDocument })
	} catch (err) {
		console.error(err)
		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const fieldName = fieldTranslations.irrigations[firstError.path] || firstError.path
			return res.status(400).json({ message: `${fieldName} الزامی یا نامعتبر است.` })
		}
		return res.status(500).json({ message: 'خطا در ثبت آبیاری.' })
	}
})

// PATCH update irrigation
router.patch('/:irrigationId', async (req, res) => {
	try {
		const { irrigationId } = req.params
		if (!mongoose.isValidObjectId(irrigationId)) return res.status(400).json({ message: 'شناسه آبیاری معتبر نیست.' })

		const irrigationDocument = await Irrigation.findById(irrigationId)
		if (!irrigationDocument) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })

		const currentUser = req.user

		if (irrigationDocument.landGroup) {
			const groupDocuments = await Irrigation.find({
				well: irrigationDocument.well,
				landGroup: irrigationDocument.landGroup,
				isOngoing: true,
			})

			const updatedGroup = await updateGroupIrrigationLogs({ groupIrrigationDocuments: groupDocuments, requestBody: req.body, currentUser })
			return res.status(200).json({ message: 'آبیاری گروهی ویرایش شد.', irrigations: updatedGroup })
		}

		const { startedAt, endedAt, isOngoing } = extractStartAndEndTimes(req.body)

		if (startedAt) irrigationDocument.startedAt = startedAt
		if (endedAt) irrigationDocument.endedAt = endedAt

		Object.entries(req.body).forEach(([fieldName, fieldValue]) => {
			if (!['startDate', 'startTime', 'endDate', 'endTime', 'createdBy'].includes(fieldName)) {
				irrigationDocument[fieldName] = fieldValue
			}
		})

		irrigationDocument.isOngoing = isOngoing
		irrigationDocument.createdBy = currentUser._id

		await irrigationDocument.save()

		const updatedIrrigation = await Irrigation.findById(irrigationId)
			.populate({ path: 'land', populate: { path: 'owner', select: 'fullName mobile' }, select: 'title owner' })
			.populate('well', 'title')
			.populate('createdBy', 'fullName mobile')

		await sendIrrigationNotificationToLandOwner({
			landId: updatedIrrigation.land._id,
			irrigationDocument: updatedIrrigation,
			endedAt,
			currentUser,
		})

		return res.status(200).json({ message: 'آبیاری با موفقیت ویرایش شد.', irrigation: updatedIrrigation })
	} catch (err) {
		console.error(err)
		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const fieldName = fieldTranslations.irrigations[firstError.path] || firstError.path
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
		const deletedIrrigation = await Irrigation.findByIdAndDelete(irrigationId)
		if (!deletedIrrigation) return res.status(404).json({ message: 'آبیاری پیدا نشد.' })
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
