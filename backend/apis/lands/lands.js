import { Router } from 'express'

import mongoose from '../../config/database.js'

import Land from '../../models/Land.model.js'

import Well from '../../models/Well.model.js'

import Irrigation from '../../models/Irrigation.model.js'

import Note from '../../models/Note.model.js'

import Schedule from '../../models/Schedule.model.js'

import { fieldTranslations } from '../../constants/fieldTranslations.js'

import { getProjection, sanitizeQuery } from '../../utils/queryUtils.js'

import { buildWaterMetrics, sumIrrigationDurationsMs, sumScheduleDurationsMs } from '../../utils/metricsUtils.js'

const router = Router()

async function attachWells(land, { includeLandGroups = false, workspaceId } = {}) {
    const projection = {
        _id: 1,
        title: 1,
        licenseCode: 1,
        cycleDays: 1,
        irrigator: 1,
    }

    if (includeLandGroups) {
        projection.landGroups = 1
    }

    const wells = await Well.find({
        lands: land._id,
        workspaceId,
    })
        .select(projection)
        .populate('irrigator', '_id fullName mobile')
        .lean()

    return { ...land, wells }
}

// GET all lands with optional filters

router.get('/', async (req, res) => {
    try {
        const safeQuery = sanitizeQuery(req.query)
        const filter = {
            workspaceId: req.workspaceId,
        }

        const allowedFields = ['title', 'owner', 'status', 'irrigationType', 'cropType', 'location']

        allowedFields.forEach(field => {
            if (safeQuery[field]) {
                if (field === 'owner') {
                    filter[field] = safeQuery[field]
                } else {
                    filter[field] = { $regex: safeQuery[field], $options: 'i' }
                }
            }
        })

        const projection = getProjection(req)

        const lands = await Land.find(filter, projection ?? undefined)
            .populate('owner')
            .lean()

        const landsWithWells = await Promise.all(
            lands.map(landItem =>
                attachWells(landItem, {
                    workspaceId: req.workspaceId,
                })
            )
        )

        return res.status(200).json({ lands: landsWithWells })
    } catch (err) {
        console.error(err.message)
        return res.status(500).json({ message: 'خطا در دریافت اطلاعات زمین‌ها!' })
    }
})

// GET land by ID

router.get('/:landId', async (req, res) => {
    try {
        const { landId } = req.params

        if (!mongoose.isValidObjectId(landId)) {
            return res.status(400).json({ message: 'شناسه زمین معتبر نیست.' })
        }

        const projection = getProjection(req)

        const land = await Land.findOne(
            {
                _id: landId,
                workspaceId: req.workspaceId,
            },
            projection ?? undefined
        )
            .populate('owner')
            .lean()

        if (!land) {
            return res.status(404).json({ message: 'زمین پیدا نشد.' })
        }

        const landWithWells = await attachWells(land, {
            includeLandGroups: true,
            workspaceId: req.workspaceId,
        })

        const wellIds = landWithWells.wells?.map(w => w._id) || []

        const ongoingIrrigations = await Irrigation.find({
            workspaceId: req.workspaceId,
            well: { $in: wellIds },
            isOngoing: true,
        })
            .select('_id well land landGroup startedAt isGroupLog wasGroupLog')
            .populate('land', '_id title')
            .lean()

        const landGroupTitlesByWellId = new Map()

        for (const well of landWithWells.wells || []) {
            const groups = new Map()

            for (const g of well.landGroups || []) {
                groups.set(g.groupId.toString(), g.title)
            }

            landGroupTitlesByWellId.set(well._id.toString(), groups)
        }

        const ongoingMap = new Map()

        for (const irrigation of ongoingIrrigations) {
            const wellKey = irrigation.well?.toString()

            if (!wellKey) continue

            if (irrigation.isGroupLog && !irrigation.wasGroupLog && irrigation.landGroup) {
                const landGroupId = irrigation.landGroup.toString()

                const groupTitle =
                    landGroupTitlesByWellId.get(wellKey)?.get(landGroupId) || ''

                ongoingMap.set(wellKey, {
                    id: irrigation._id.toString(),
                    type: 'landGroup',
                    landGroupId,
                    title: groupTitle,
                    startedAt: irrigation.startedAt,
                })

                continue
            }

            if (irrigation.land) {
                ongoingMap.set(wellKey, {
                    id: irrigation._id.toString(),
                    type: 'land',
                    landId: irrigation.land._id.toString(),
                    title: irrigation.land.title,
                    startedAt: irrigation.startedAt,
                })
            }
        }

        const wellsWithDetails = await Promise.all(
            (landWithWells.wells || []).map(async well => {
                const wellId = well._id?.toString()
                const irrigationInfo = ongoingMap.get(wellId)

                let totalRequiredMs = 0
                let receivedMs = 0
                let nextIrrigation = null

                if (well._id) {
                    const schedules = await Schedule.find({
                        workspaceId: req.workspaceId,
                        well: well._id,
                        land: land._id,
                    }).lean()

                    const irrigations = await Irrigation.find({
                        workspaceId: req.workspaceId,
                        well: well._id,
                        land: land._id,
                    }).lean()

                    totalRequiredMs = sumScheduleDurationsMs(schedules)
                    receivedMs = sumIrrigationDurationsMs(irrigations)

                    const nextLog = await Irrigation.find({
                        workspaceId: req.workspaceId,
                        well: well._id,
                        land: land._id,
                        endedAt: null,
                    })
                        .sort({ startedAt: 1 })
                        .lean()

                    nextIrrigation = nextLog[0]?.startedAt || null
                }

                const { landGroups, ...wellData } = well

                const wellWithMetrics = {
                    ...wellData,
                    isOngoing: !!irrigationInfo,
                    nextIrrigation,
                }

                if (irrigationInfo) {
                    let targetRequiredMs = 0
                    let targetReceivedMs = 0

                    if (irrigationInfo.type === 'land') {
                        targetRequiredMs = totalRequiredMs
                        targetReceivedMs = receivedMs
                    } else if (irrigationInfo.type === 'landGroup') {
                        const [schedules, irrigations] = await Promise.all([
                            Schedule.find({
                                workspaceId: req.workspaceId,
                                well: well._id,
                                landGroup: irrigationInfo.landGroupId,
                            }).lean(),
                            Irrigation.find({
                                workspaceId: req.workspaceId,
                                well: well._id,
                                landGroup: irrigationInfo.landGroupId,
                                isGroupLog: true,
                                wasGroupLog: false,
                            }).lean(),
                        ])

                        targetRequiredMs = sumScheduleDurationsMs(schedules)
                        targetReceivedMs = sumIrrigationDurationsMs(irrigations)
                    }

                    const metrics = buildWaterMetrics({
                        requiredMs: targetRequiredMs,
                        receivedMs: targetReceivedMs,
                    })

                    wellWithMetrics.irrigationTarget = {
                        ...irrigationInfo,
                        ...metrics,
                    }
                }

                return {
                    well: wellWithMetrics,
                    requiredMs: totalRequiredMs,
                    receivedMs,
                }
            })
        )

        const totalRequiredMs = wellsWithDetails.reduce(
            (sum, i) => sum + i.requiredMs,
            0
        )

        const totalReceivedMs = wellsWithDetails.reduce(
            (sum, i) => sum + i.receivedMs,
            0
        )

        const logs = await Irrigation.find({
            workspaceId: req.workspaceId,
            land: land._id,
        })
            .sort({ updatedAt: -1 })
            .lean()

        const notes = await Note.find({
            workspaceId: req.workspaceId,
            reference: land._id,
            type: 'land',
        })
            .populate('user', '_id fullName')
            .lean()

        return res.status(200).json({
            land: {
                ...landWithWells,
                ...buildWaterMetrics({
                    requiredMs: totalRequiredMs,
                    receivedMs: totalReceivedMs,
                }),
                wells: wellsWithDetails.map(i => i.well),
                logs,
                notes,
            },
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'خطای داخلی سرور.' })
    }
})

// POST create new land

router.post('/', async (req, res) => {
    try {
        const {
            title,
            owner,
            area,
            kFactor,
            location,
            irrigationType,
            cropType,
            note,
            wellId,
        } = req.body

        const userId = req.user._id

        const newLand = await Land.create({
            title,
            owner,
            area,
            kFactor,
            location,
            irrigationType,
            cropType,
            workspaceId: req.workspaceId,
        })

        if (note) {
            await Note.create({
                workspaceId: req.workspaceId,
                user: userId,
                text: note,
                type: 'land',
                reference: newLand._id,
                typeRef: 'Land',
            })
        }

        if (wellId) {
            const well = await Well.findOne({
                _id: wellId,
                workspaceId: req.workspaceId,
            })

            if (!well) {
                return res.status(404).json({ message: 'چاه مورد نظر یافت نشد.' })
            }

            well.lands.push(newLand._id)
            await well.save()
        }

        const populatedLand = await Land.findOne({
            _id: newLand._id,
            workspaceId: req.workspaceId,
        })
            .populate('owner')
            .lean()

        const landWithWells = await attachWells(populatedLand, {
            workspaceId: req.workspaceId,
        })

        return res.status(201).json({
            message: 'زمین با موفقیت ایجاد شد.',
            land: landWithWells,
        })
    } catch (err) {
        console.error(err.message)

        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0]
            const fieldName = fieldTranslations.lands[field] || field

            return res.status(409).json({
                message: `این ${fieldName} قبلاً ثبت شده است.`,
            })
        }

        if (err.name === 'ValidationError') {
            const firstError = Object.values(err.errors)[0]
            const field = firstError.path
            const fieldName = fieldTranslations.lands[field] || field

            return res.status(400).json({
                message: `${fieldName} الزامی است.`,
            })
        }

        return res.status(500).json({ message: 'خطا در ایجاد زمین.' })
    }
})

// PATCH update land

router.patch('/:landId', async (req, res) => {
    try {
        const { landId } = req.params
        const updates = { ...req.body }
        const { wellId } = updates

        delete updates.workspaceId

        const land = await Land.findOne({
            _id: landId,
            workspaceId: req.workspaceId,
        })

        if (!land) {
            return res.status(404).json({ message: 'زمین پیدا نشد.' })
        }

        if (wellId) {
            await Well.updateMany(
                {
                    workspaceId: req.workspaceId,
                    lands: land._id,
                },
                {
                    $pull: {
                        lands: land._id,
                    },
                }
            )

            const well = await Well.findOne({
                _id: wellId,
                workspaceId: req.workspaceId,
            })

            if (!well) {
                return res.status(404).json({ message: 'چاه مورد نظر یافت نشد.' })
            }

            if (!well.lands.includes(land._id)) {
                well.lands.push(land._id)
                await well.save()
            }
        }

        delete updates.wellId

        Object.assign(land, updates)
        await land.save()

        const populatedLand = await Land.findOne({
            _id: landId,
            workspaceId: req.workspaceId,
        })
            .populate('owner')
            .lean()

        const updated = await attachWells(populatedLand, {
            workspaceId: req.workspaceId,
        })

        return res.status(200).json({
            message: 'زمین با موفقیت ویرایش شد.',
            land: updated,
        })
    } catch (err) {
        console.error(err.message)

        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0]
            const fieldName = fieldTranslations.lands[field] || field

            return res.status(409).json({
                message: `این ${fieldName} قبلاً ثبت شده است.`,
            })
        }

        return res.status(500).json({ message: 'خطا در ویرایش زمین.' })
    }
})

// DELETE land

router.delete('/:landId', async (req, res) => {
    try {
        const { landId } = req.params

        const land = await Land.findOneAndDelete({
            _id: landId,
            workspaceId: req.workspaceId,
        })

        if (!land) {
            return res.status(404).json({ message: 'زمین پیدا نشد.' })
        }

        await Note.deleteMany({
            workspaceId: req.workspaceId,
            reference: landId,
            type: 'land',
        })

        return res.status(200).json({
            message: 'زمین با موفقیت حذف شد.',
        })
    } catch (err) {
        console.error('خطا در حذف زمین:', err.message)

        return res.status(500).json({
            message: 'خطای داخلی سرور.',
        })
    }
})

// POST add note to land

router.post('/:landId/notes', async (req, res) => {
    try {
        const { landId } = req.params
        const { text } = req.body
        const userId = req.user._id

        const land = await Land.findOne({
            _id: landId,
            workspaceId: req.workspaceId,
        })

        if (!land) {
            return res.status(404).json({ message: 'زمین پیدا نشد.' })
        }

        const newNote = await Note.create({
            workspaceId: req.workspaceId,
            user: userId,
            text,
            type: 'land',
            reference: landId,
            typeRef: 'Land',
        })

        await newNote.populate('user', '_id fullName')

        return res.status(200).json({
            message: 'یادداشت با موفقیت اضافه شد.',
            note: newNote,
        })
    } catch (err) {
        console.error(err.message)

        return res.status(500).json({
            message: 'خطا در افزودن یادداشت.',
        })
    }
})

// PUT update a specific note

router.put('/:landId/notes/:noteId', async (req, res) => {
    try {
        const { landId, noteId } = req.params
        const { text } = req.body
        const userId = req.user._id
        const isAdmin = req.isAdmin

        const note = await Note.findOne({
            _id: noteId,
            workspaceId: req.workspaceId,
            reference: landId,
            type: 'land',
        })

        if (!note) {
            return res.status(404).json({ message: 'یادداشت پیدا نشد.' })
        }

        if (!note.user.equals(userId) && !isAdmin) {
            return res.status(403).json({
                message: 'دسترسی غیرمجاز به یادداشت.',
            })
        }

        note.text = text
        await note.save()
        await note.populate('user', '_id fullName')

        return res.status(200).json({
            message: 'یادداشت به‌روزرسانی شد.',
            note,
        })
    } catch (err) {
        console.error(err.message)

        return res.status(500).json({
            message: 'خطا در ویرایش یادداشت.',
        })
    }
})

// DELETE specific note from land

router.delete('/:landId/notes/:noteId', async (req, res) => {
    try {
        const { landId, noteId } = req.params
        const userId = req.user._id
        const isAdmin = req.isAdmin

        const note = await Note.findOne({
            _id: noteId,
            workspaceId: req.workspaceId,
            reference: landId,
            type: 'land',
        })

        if (!note) {
            return res.status(404).json({
                message: 'یادداشت پیدا نشد.',
            })
        }

        if (!note.user.equals(userId) && !isAdmin) {
            return res.status(403).json({
                message: 'شما اجازه حذف این یادداشت را ندارید.',
            })
        }

        await note.deleteOne()

        return res.status(200).json({
            message: 'یادداشت با موفقیت حذف شد.',
        })
    } catch (err) {
        console.error(err.message)

        return res.status(500).json({
            message: 'خطا در حذف یادداشت.',
        })
    }
})

// Fallback for unsupported methods

router.all(/.*/, (req, res) => {
    return res.status(405).send({
        error: 'Method Not Allowed',
    })
})

export default router