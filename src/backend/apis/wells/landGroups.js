import { Router } from 'express'
import Well from '../../models/Well.model.js'
import mongoose from 'mongoose'
import Irrigation from '../../models/Irrigation.model.js'
import Schedule from '../../models/Schedule.model.js'
import Note from '../../models/Note.model.js'
import { buildWaterMetrics, sumIrrigationDurationsMs, sumScheduleDurationsMs } from '../../utils/metricsUtils.js'
import { getProjection } from '../../utils/queryUtils.js'

const router = Router({ mergeParams: true })

router.get('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const wellProjection = getProjection(req)
		const well = await Well.findById(wellId, wellProjection ?? undefined)
			.populate('landGroups.lands')
			.lean()

		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const startDate = new Date(well.cycleStartDate)
		const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24))
		const cyclesPassed = Math.floor(daysPassed / well.cycleDays)
		const cycleStart = new Date(startDate.getTime() + cyclesPassed * well.cycleDays * 24 * 60 * 60 * 1000)
		const cycleEnd = new Date(cycleStart.getTime() + well.cycleDays * 24 * 60 * 60 * 1000)

		for (const group of well.landGroups) {
			const scheduleProjection = getProjection(req)
			const schedules = await Schedule.find({ well: wellId, landGroup: group.groupId }, scheduleProjection ?? undefined).lean()
			const totalSchedulesInCycle = schedules.length
			const totalRequiredMs = sumScheduleDurationsMs(schedules)

			const irrigationProjection = getProjection(req)
			const irrigations = await Irrigation.find(
				{
					well: wellId,
					landGroup: group.groupId,
					isGroupLog: true,
					startedAt: { $gte: cycleStart },
					endedAt: { $lte: cycleEnd },
				},
				irrigationProjection ?? undefined
			).lean()

			const receivedMs = sumIrrigationDurationsMs(irrigations)
			const waterMetrics = buildWaterMetrics({ requiredMs: totalRequiredMs, receivedMs })

			group.requiredWater = waterMetrics.requiredWater
			group.receivedWater = waterMetrics.receivedWater
			group.remainingWater = waterMetrics.remainingWater
			group.totalSchedulesInCycle = totalSchedulesInCycle
			group.receivedWaterInCycle = waterMetrics.receivedWater
		}

		return res.status(200).json({ landGroups: well.landGroups || [] })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت گروه‌ها.' })
	}
})

router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { title, lands } = req.body

		if (!title) {
			return res.status(400).json({ message: 'عنوان گروه الزامی است.' })
		}

		const well = await Well.findById(wellId).populate('lands')
		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		const invalidLands = lands.filter(landId => !well.lands.some(wLand => wLand._id.equals(landId)))
		if (invalidLands.length > 0) {
			return res.status(400).json({ message: 'برخی از زمین‌ها به این چاه تعلق ندارند.' })
		}

		const group = {
			groupId: new mongoose.Types.ObjectId(),
			title,
			lands,
		}

		well.landGroups.push(group)
		await well.save()

		return res.status(201).json({ message: 'گروه زمین ایجاد شد.', group })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد گروه.' })
	}
})

router.get('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params
		const well = await Well.findById(wellId)
			.populate({
				path: 'landGroups.lands',
				populate: { path: 'owner', model: 'User', select: 'fullName mobile address' },
			})
			.lean()

		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })
		const group = well.landGroups.find(g => g.groupId.equals(groupId))
		if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

		const startDate = new Date(well.cycleStartDate)
		const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24))
		const cyclesPassed = Math.floor(daysPassed / well.cycleDays)
		const cycleStart = new Date(startDate.getTime() + cyclesPassed * well.cycleDays * 86400000)
		const cycleEnd = new Date(cycleStart.getTime() + well.cycleDays * 86400000)

		const schedules = await Schedule.find({ well: wellId, landGroup: group.groupId }).lean()
		const irrigations = await Irrigation.find({
			well: wellId,
			landGroup: group.groupId,
			isGroupLog: true,
			startedAt: { $gte: cycleStart },
			$or: [{ endedAt: { $lte: cycleEnd } }, { isOngoing: true }],
		}).lean()

		const { requiredWater, receivedWater, remainingWater } = buildWaterMetrics({
			requiredMs: sumScheduleDurationsMs(schedules),
			receivedMs: sumIrrigationDurationsMs(irrigations),
		})

		// 🔹 Detect ongoing irrigation
		const ongoingIrrigation = await Irrigation.findOne({ well: wellId, isOngoing: true })
			.select('land landGroup startedAt isGroupLog wasGroupLog')
			.populate('land', '_id title')
			.lean()

		let irrigationTarget = null
		if (ongoingIrrigation) {
			const isGroup = ongoingIrrigation.isGroupLog && !ongoingIrrigation.wasGroupLog && ongoingIrrigation.landGroup

			if (isGroup) {
				const targetGroupId = ongoingIrrigation.landGroup
				const [targetSchedules, targetIrrigations] = await Promise.all([
					Schedule.find({ well: wellId, landGroup: targetGroupId }).lean(),
					Irrigation.find({
						well: wellId,
						landGroup: targetGroupId,
						isGroupLog: true,
						wasGroupLog: false,
					}).lean(),
				])

				const metrics = buildWaterMetrics({
					requiredMs: sumScheduleDurationsMs(targetSchedules),
					receivedMs: sumIrrigationDurationsMs(targetIrrigations),
				})

				const title = well.landGroups.find(g => g.groupId.equals(targetGroupId))?.title || ''
				irrigationTarget = {
					type: 'landGroup',
					id: targetGroupId.toString(),
					title,
					startedAt: ongoingIrrigation.startedAt,
					...metrics,
				}
			} else if (ongoingIrrigation.land) {
				const landId = ongoingIrrigation.land._id
				const [targetSchedules, targetIrrigations] = await Promise.all([
					Schedule.find({ well: wellId, land: landId }).lean(),
					Irrigation.find({ well: wellId, land: landId }).lean(),
				])

				const metrics = buildWaterMetrics({
					requiredMs: sumScheduleDurationsMs(targetSchedules),
					receivedMs: sumIrrigationDurationsMs(targetIrrigations),
				})

				irrigationTarget = {
					type: 'land',
					id: landId.toString(),
					title: ongoingIrrigation.land.title,
					startedAt: ongoingIrrigation.startedAt,
					...metrics,
				}
			}
		}

		const logs = irrigations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		const notes = await Note.find({ type: 'landGroup', reference: group.groupId }).sort({ createdAt: -1 }).lean()

		return res.status(200).json({
			groupId: group.groupId,
			title: group.title,
			requiredWater,
			receivedWater,
			remainingWater,
			lastIrrigation: logs.length ? logs[0].createdAt : null,
			logs,
			notes,
			wells: [
				{
					_id: well._id,
					title: well.title,
					isOngoing: Boolean(irrigationTarget),
					...(irrigationTarget ? { irrigationTarget } : {}),
				},
			],
			lands: group.lands.map(l => ({
				_id: l._id,
				title: l.title,
				owner: l.owner
					? {
							_id: l.owner._id,
							fullName: l.owner.fullName,
							mobile: l.owner.mobile,
							address: l.owner.address,
					  }
					: null,
				location: l.location || '',
			})),
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت اطلاعات گروه.' })
	}
})

router.patch('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params
		const { title, lands } = req.body

		const well = await Well.findById(wellId).populate('lands')
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const group = well.landGroups.find(g => g.groupId.equals(groupId))
		if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

		if (title) group.title = title

		if (lands) {
			const invalidLands = lands.filter(landId => !well.lands.some(wLand => wLand._id.equals(landId)))
			if (invalidLands.length > 0) {
				return res.status(400).json({ message: 'برخی از زمین‌ها به این چاه تعلق ندارند.' })
			}
			group.lands = lands
		}

		await well.save()
		return res.status(200).json({ message: 'گروه به‌روزرسانی شد.', group })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ویرایش گروه.' })
	}
})

router.delete('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params
		const well = await Well.findById(wellId)
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const beforeCount = well.landGroups.length
		well.landGroups = well.landGroups.filter(g => !g.groupId.equals(groupId))

		if (beforeCount === well.landGroups.length) {
			return res.status(404).json({ message: 'گروه پیدا نشد.' })
		}

		await well.save()
		return res.status(200).json({ message: 'گروه حذف شد.' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در حذف گروه.' })
	}
})

export default router
