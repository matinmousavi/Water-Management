import { Router } from 'express'
import Well from '../../models/Well.model.js'
import mongoose from 'mongoose'
import Irrigation from '../../models/Irrigation.model.js'
import Schedule from '../../models/Schedule.model.js'
import Note from '../../models/Note.model.js'
import { buildWaterMetrics, sumIrrigationDurationsMs, sumScheduleDurationsMs } from '../../utils/metricsUtils.js'
import { getProjection } from '../../utils/queryUtils.js'
import { groupIrrigationLogs } from '../../utils/irrigationUtils.js'

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
			const irrigationsRaw = await Irrigation.find(
				{
					well: wellId,
					landGroup: group.groupId,
					isGroupLog: true,
					startedAt: { $gte: cycleStart },
					endedAt: { $lte: cycleEnd },
				},
				irrigationProjection ?? undefined
			).lean()

			// ادغام لاگ‌های گروه برای جلوگیری از چندبرابری
			const irrigations = groupIrrigationLogs(irrigationsRaw)

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

		const irrigationsRaw = await Irrigation.find({
			well: wellId,
			landGroup: group.groupId,
			isGroupLog: true,
			startedAt: { $gte: cycleStart },
			$or: [{ endedAt: { $lte: cycleEnd } }, { isOngoing: true }],
		}).lean()

		const mergedIrrigations = groupIrrigationLogs(irrigationsRaw)

		const irrigationsDone = mergedIrrigations.filter(ir => !ir.isOngoing && ir.endedAt)
		const receivedMs = sumIrrigationDurationsMs(irrigationsDone)
		const requiredMs = sumScheduleDurationsMs(schedules)

		const { requiredWater, receivedWater, remainingWater } = buildWaterMetrics({
			requiredMs,
			receivedMs,
		})

		const ongoing = await Irrigation.findOne({ well: wellId, isOngoing: true })
			.select('_id land landGroup startedAt isGroupLog wasGroupLog')
			.populate('land', '_id title')
			.lean()

		let irrigationTarget = null
		if (ongoing) {
			const isGroup = ongoing.isGroupLog && !ongoing.wasGroupLog && ongoing.landGroup

			if (isGroup) {
				const targetGroupId = ongoing.landGroup
				const targetGroup = well.landGroups.find(g => g.groupId.equals(targetGroupId))
				const title = targetGroup?.title || ''

				let targetRequiredWater = requiredWater
				let targetReceivedWater = receivedWater
				let targetRemainingWater = remainingWater

				if (!targetGroupId.equals(groupId)) {
					const targetSchedules = await Schedule.find({
						well: wellId,
						landGroup: targetGroupId,
					}).lean()

					const targetIrrigationsRaw = await Irrigation.find({
						well: wellId,
						landGroup: targetGroupId,
						isGroupLog: true,
						startedAt: { $gte: cycleStart },
						$or: [{ endedAt: { $lte: cycleEnd } }, { isOngoing: true }],
					}).lean()

					const targetMergedIrrigations = groupIrrigationLogs(targetIrrigationsRaw)
					const targetIrrigationsDone = targetMergedIrrigations.filter(ir => !ir.isOngoing && ir.endedAt)
					const targetReceivedMs = sumIrrigationDurationsMs(targetIrrigationsDone)
					const targetRequiredMs = sumScheduleDurationsMs(targetSchedules)

					const targetMetrics = buildWaterMetrics({
						requiredMs: targetRequiredMs,
						receivedMs: targetReceivedMs,
					})

					targetRequiredWater = targetMetrics.requiredWater
					targetReceivedWater = targetMetrics.receivedWater
					targetRemainingWater = targetMetrics.remainingWater
				}

				irrigationTarget = {
					id: String(ongoing._id),
					type: 'landGroup',
					landGroupId: String(targetGroupId),
					title,
					startedAt: ongoing.startedAt,
					requiredWater: targetRequiredWater,
					receivedWater: targetReceivedWater,
					remainingWater: targetRemainingWater,
				}
			} else if (ongoing.land) {
				const targetLandId = ongoing.land._id

				const targetSchedules = await Schedule.find({
					well: wellId,
					land: targetLandId,
				}).lean()

				const targetIrrigationsRaw = await Irrigation.find({
					well: wellId,
					land: targetLandId,
					isGroupLog: false,
					startedAt: { $gte: cycleStart },
					$or: [{ endedAt: { $lte: cycleEnd } }, { isOngoing: true }],
				}).lean()

				const targetReceivedMs = sumIrrigationDurationsMs(targetIrrigationsRaw.filter(ir => !ir.isOngoing && ir.endedAt))
				const targetRequiredMs = sumScheduleDurationsMs(targetSchedules)

				const targetMetrics = buildWaterMetrics({
					requiredMs: targetRequiredMs,
					receivedMs: targetReceivedMs,
				})

				irrigationTarget = {
					id: String(ongoing._id),
					type: 'land',
					landId: String(targetLandId),
					title: ongoing.land.title,
					startedAt: ongoing.startedAt,
					requiredWater: targetMetrics.requiredWater,
					receivedWater: targetMetrics.receivedWater,
					remainingWater: targetMetrics.remainingWater,
				}
			}
		}

		const logs = [...mergedIrrigations].sort((a, b) => {
			const aT = new Date(a.createdAt || a.startedAt || 0).getTime()
			const bT = new Date(b.createdAt || b.startedAt || 0).getTime()
			return bT - aT
		})

		const notes = await Note.find({ type: 'landGroup', reference: group.groupId }).sort({ createdAt: -1 }).lean()

		return res.status(200).json({
			groupId: group.groupId,
			title: group.title,
			requiredWater,
			receivedWater,
			remainingWater,
			lastIrrigation: logs.length ? logs[0].createdAt || logs[0].startedAt || null : null,
			logs,
			notes,
			wells: [
				{
					_id: well._id,
					title: well.title,
					isOngoing: Boolean(ongoing),
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
