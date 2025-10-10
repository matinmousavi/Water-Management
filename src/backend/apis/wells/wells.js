import { Router } from 'express'
import Well from '../../models/Well.model.js'
import Note from '../../models/Note.model.js'
import Irrigation from '../../models/Irrigation.model.js'
import { fieldTranslations } from '../../constants/fieldTranslations.js'
import { getProjection, sanitizeQuery } from '../../utils/queryUtils.js'
import landGroupsRouter from './landGroups.js'
import schedulesRouter from './schedules.js'
import snapshotsRouter from './snapshots.js'
import { pickFields } from '../../utils/objectUtils.js'
import Schedule from '../../models/Schedule.model.js'
import { buildWaterMetrics, sumIrrigationDurationsMs, sumScheduleDurationsMs } from '../../utils/metricsUtils.js'

const router = Router()

// Helper: Attach populated landGroup title
const getLandGroupTitle = (landGroupId, well) => {
	if (!landGroupId || !well || !well.landGroups) return null
	const group = well.landGroups.find(g => g.groupId.toString() === landGroupId.toString())
	return group ? group.title : null
}

// GET all wells with filters and fields query params
router.get('/', async (req, res) => {
	try {
		const safeQuery = sanitizeQuery(req.query)
		const { filters, fields } = safeQuery

		let filterObj = {}
		if (filters) {
			try {
				filterObj = JSON.parse(filters)
			} catch {
				return res.status(400).json({ message: 'پارامتر filters نامعتبر است.' })
			}
		}

		const allowedFilterFields = ['title', 'licenseCode', 'irrigator', 'status']
		const mongoFilter = {}

		Object.entries(filterObj).forEach(([key, value]) => {
			if (allowedFilterFields.includes(key)) {
				if (key === 'irrigator') {
					mongoFilter[key] = value
				} else if (typeof value === 'string') {
					mongoFilter[key] = { $regex: `^${value}$`, $options: 'i' }
				}
			}
		})

		const requestedFields =
			typeof fields === 'string'
				? fields
						.split(',')
						.map(field => field.trim())
						.filter(Boolean)
				: []
		const projection = getProjection(req)
		if (projection) {
			if (!fields || requestedFields.includes('logs')) {
				projection.landGroups = 1
			}
			if (!fields || requestedFields.includes('lands')) {
				projection.lands = 1
			}
		}

		let wells = await Well.find(mongoFilter, projection ?? undefined)
			.populate({
				path: 'lands',
				populate: { path: 'owner', select: 'fullName mobile' },
			})
			.populate({ path: 'irrigator', select: 'fullName mobile' })
			.lean()

		wells = await Promise.all(
			wells.map(async well => {
				const includeLogs = !fields || requestedFields.includes('logs')
				const includeNotes = !fields || requestedFields.includes('notes')
				const includeLands = !fields || requestedFields.includes('lands')

				if (includeLogs) {
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
				}

				if (includeLands) {
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
				}

				if (includeNotes) {
					const notes = await Note.find({ type: 'well', reference: well._id }).populate('user', 'fullName').lean()
					well.notes = notes
				}

				return pickFields(well, fields)
			})
		)

		return res.status(200).json({ wells })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در دریافت اطلاعات چاه‌ها!' })
	}
})

// GET single well by ID, with optional fields param
router.get('/:wellId', async (req, res) => {
	try {
		const { wellId } = req.params
		const { fields } = req.query
		const requestedFields =
			typeof fields === 'string'
				? fields
						.split(',')
						.map(field => field.trim())
						.filter(Boolean)
				: []
		const projection = getProjection(req)
		if (projection) {
			if (!fields || requestedFields.includes('logs')) {
				projection.landGroups = 1
			}
			if (!fields || requestedFields.includes('lands')) {
				projection.lands = 1
			}
		}

		let well = await Well.findById(wellId, projection ?? undefined)
			.populate({
				path: 'lands',
				populate: { path: 'owner', select: 'fullName mobile' },
				select: 'title status owner area location',
			})
			.populate({ path: 'irrigator', select: 'fullName mobile' })
			.lean()

		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		const includeLogs = !fields || requestedFields.includes('logs')
		const includeNotes = !fields || requestedFields.includes('notes')
		const includeLands = !fields || requestedFields.includes('lands')

		if (includeLogs) {
			let logs = await Irrigation.find({ well: wellId })
				.populate({
					path: 'land',
					populate: { path: 'owner', select: 'fullName mobile' },
					select: 'title owner area location',
				})
				.populate('createdBy', 'fullName')
				.sort({ createdAt: -1 })
				.lean()

			logs = await Promise.all(
				logs.map(async log => {
					const landGroupTitle = getLandGroupTitle(log.landGroup, well)
					let requiredWater = null
					let receivedWater = null
					let remainingWater = null

					if (!log.endedAt) {
						const schedules = await Schedule.find({
							well: wellId,
							landGroup: log.landGroup || log.land,
						}).lean()

						const totalRequiredMs = sumScheduleDurationsMs(schedules)

						const previousIrrigations = await Irrigation.find({
							well: wellId,
							landGroup: log.landGroup || log.land,
							isGroupLog: log.isGroupLog || false,
							endedAt: { $exists: true },
						}).lean()

						const receivedMs = sumIrrigationDurationsMs(previousIrrigations)
						const waterMetrics = buildWaterMetrics({ requiredMs: totalRequiredMs, receivedMs })

						requiredWater = waterMetrics.requiredWater
						receivedWater = waterMetrics.receivedWater
						remainingWater = waterMetrics.remainingWater
					}

					return {
						...log,
						landGroupTitle,
						requiredWater,
						receivedWater,
						remainingWater,
					}
				})
			)

			well.logs = logs
		}

		if (includeLands) {
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
		}

		if (includeNotes) {
			const notes = await Note.find({ type: 'well', reference: wellId }).populate('user', 'fullName').lean()
			well.notes = notes
		}

		return res.status(200).json({
			well: pickFields(well, fields),
		})
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
})

// POST create well
router.post('/', async (req, res) => {
	try {
		let { title, licenseCode, cycleDays, cycleStartDate, location, irrigator, lands, workTime } = req.body

		if (Array.isArray(lands)) {
			lands = [...new Set(lands.map(item => (typeof item === 'string' ? item : item._id)))]
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

		if (updates.lands && Array.isArray(updates.lands)) {
			updates.lands = [...new Set(updates.lands.map(item => (typeof item === 'string' ? item : item._id)))]
		}

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

		if (updates.lands && Array.isArray(updates.lands)) {
			const removedLands = well.lands.filter(existingLand => !updates.lands.includes(existingLand.toString()))

			if (removedLands.length > 0 && well.landGroups && well.landGroups.length > 0) {
				removedLands.forEach(removedLandId => {
					const groupIndex = well.landGroups.findIndex(g => g.lands.some(l => l.toString() === removedLandId.toString()))
					if (groupIndex !== -1) {
						well.landGroups[groupIndex].lands = well.landGroups[groupIndex].lands.filter(id => id.toString() !== removedLandId.toString())

						if (well.landGroups[groupIndex].lands.length < 2) {
							well.landGroups.splice(groupIndex, 1)
						}
					}
				})
			}
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
