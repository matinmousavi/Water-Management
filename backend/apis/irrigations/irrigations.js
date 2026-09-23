import { Router } from 'express'

import mongoose from '../../config/database.js'

import Irrigation from '../../models/Irrigation.model.js'

import { sendTemplatedSMS } from '../../utils/messageUtils.js'

import { fieldTranslations } from '../../constants/fieldTranslations.js'

import { getProjection, sanitizeQuery } from '../../utils/queryUtils.js'

import Land from '../../models/Land.model.js'

import Well from '../../models/Well.model.js'

import { checkIrrigationConflict } from '../../utils/irrigationUtils.js'

const router = Router()

// Utility: merge date + time into a Date object

const mergeDateTime = (dateStr, timeStr) => {
    const date = dateStr ? new Date(dateStr) : new Date()
    const time = timeStr ? new Date(timeStr) : new Date()

    if (dateStr && timeStr) {
        const combined = new Date(date)

        combined.setHours(time.getHours(), time.getMinutes(), 0, 0)

        return combined
    } else if (timeStr) {
        const combined = new Date()

        combined.setHours(time.getHours(), time.getMinutes(), 0, 0)

        return combined
    } else if (dateStr) {
        const combined = new Date(date)

        combined.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0)

        return combined
    }
}

// Utility: extract start/end and ongoing

const extractStartAndEndTimes = body => {
    let startedAt, endedAt

    let isOngoing = body.isOngoing

    if (body.startDate && body.startTime) {
        startedAt = mergeDateTime(body.startDate, body.startTime)
    } else if (body.startTime) {
        startedAt = mergeDateTime(null, body.startTime)
    } else if (body.startDate) {
        startedAt = mergeDateTime(body.startDate, null)
    }

    if (body.endDate && body.endTime) {
        endedAt = mergeDateTime(body.endDate, body.endTime)
        isOngoing = false
    } else if (body.endTime) {
        endedAt = mergeDateTime(null, body.endTime)
        isOngoing = false
    } else if (body.endDate) {
        endedAt = mergeDateTime(body.endDate, null)
        isOngoing = false
    }

    return { startedAt, endedAt, isOngoing }
}

// Get land group title for display

const getLandGroupTitle = async (irrigation, well, workspaceId) => {
    if (!irrigation.landGroup) {
        const landDocument = await Land.findOne({
            _id: irrigation.land,
            workspaceId,
        })

        if (!landDocument?.groupMemberships?.length) return null

        const membership = landDocument.groupMemberships.find(
            m =>
                m.wellId.toString() === irrigation.well.toString() &&
                m.startDate <= irrigation.startedAt &&
                (!m.endDate || m.endDate >= irrigation.startedAt)
        )

        return membership ? membership.groupTitle : null
    }

    if (!well?.landGroups) return null

    const group = well.landGroups.find(
        g => g.groupId.toString() === irrigation.landGroup.toString()
    )

    return group ? group.title : null
}

// Send SMS to land owner

const sendIrrigationNotificationToLandOwner = async ({
    landId,
    irrigationDocument,
    endedAt,
    currentUser,
    workspaceId,
}) => {
    const landDocument = await Land.findOne({
        _id: landId,
        workspaceId,
    }).populate('owner', 'fullName mobile notificationsEnabled')

    if (!landDocument?.notificationsEnabled || !landDocument.owner?.mobile) return

    const recipientMobile = landDocument.owner.mobile
    const landTitle = landDocument.title

    if (!endedAt) {
        await sendTemplatedSMS({
            to: recipientMobile,
            key: 'irrigation_start_irrigator',
            variables: {
                land_title: landTitle,
                start_time: irrigationDocument.startedAt.toLocaleTimeString('fa-IR'),
            },
        })
    } else if (irrigationDocument.duration) {
        const wellDocument = await Well.findOne({
            _id: irrigationDocument.well,
            workspaceId,
        })

        await sendTemplatedSMS({
            to: recipientMobile,
            key: 'irrigation_end_irrigator',
            variables: {
                land_title: landTitle,
                duration: irrigationDocument.duration,
                well_irrigator: currentUser?.fullName || '',
                well_title: wellDocument?.title || '',
                end_time: irrigationDocument.endedAt.toLocaleTimeString('fa-IR'),
            },
        })
    }
}

// Update group irrigation logs

const updateGroupIrrigationLogs = async ({
    groupIrrigationDocuments,
    requestBody,
    currentUser,
    workspaceId,
}) => {
    const { startedAt, endedAt, isOngoing } = extractStartAndEndTimes(requestBody)

    for (const irrigationDocument of groupIrrigationDocuments) {
        if (startedAt) irrigationDocument.startedAt = startedAt

        if (endedAt && !irrigationDocument.endedAt) {
            irrigationDocument.endedAt = endedAt
        }

        Object.entries(requestBody).forEach(([fieldName, fieldValue]) => {
            if (
                ![
                    'startDate',
                    'startTime',
                    'endDate',
                    'endTime',
                    'createdBy',
                    'workspaceId',
                    'land',
                    'well',
                    'landGroup',
                    '_id',
                    'isGroupLog',
                ].includes(fieldName)
            ) {
                irrigationDocument[fieldName] = fieldValue
            }
        })

        irrigationDocument.isOngoing = isOngoing
        irrigationDocument.createdBy = currentUser._id

        await irrigationDocument.save()

        await sendIrrigationNotificationToLandOwner({
            landId: irrigationDocument.land,
            irrigationDocument,
            endedAt,
            currentUser,
            workspaceId,
        })
    }

    const updatedIrrigations = await Irrigation.find({
        workspaceId,
        well: groupIrrigationDocuments[0].well,
        landGroup: groupIrrigationDocuments[0].landGroup,
    })
        .populate({
            path: 'land',
            populate: {
                path: 'owner',
                select: 'fullName mobile',
            },
            select: 'title owner',
        })
        .populate('well', 'title landGroups')
        .populate('createdBy', 'fullName mobile')
        .lean()

    for (const irrigation of updatedIrrigations) {
        irrigation.landGroupTitle = await getLandGroupTitle(
            irrigation,
            irrigation.well,
            workspaceId
        )

        irrigation.totalReceivedWater = irrigation.duration
    }

    return updatedIrrigations
}

// GET all irrigations

router.get('/', async (req, res) => {
    try {
        const safeQuery = sanitizeQuery(req.query)

        const filter = {
            workspaceId: req.workspaceId,
        }

        const allowedFilters = ['land', 'well', 'createdBy', 'landGroup']

        allowedFilters.forEach(field => {
            if (safeQuery[field]) filter[field] = safeQuery[field]
        })

        const projection = getProjection(req)

        let irrigations = await Irrigation.find(
            filter,
            projection ?? undefined
        )
            .populate({
                path: 'land',
                populate: {
                    path: 'owner',
                    select: 'fullName mobile',
                },
                select: 'title owner',
            })
            .populate('well', 'title landGroups')
            .populate('createdBy', 'fullName mobile')
            .sort({ createdAt: -1 })
            .lean()

        if (safeQuery.landGroup) {
            const uniqueLogsMap = new Map()

            for (const log of irrigations) {
                const key = `${new Date(log.startedAt).getTime()}-${log.endedAt ? new Date(log.endedAt).getTime() : 'null'}`

                if (!uniqueLogsMap.has(key)) {
                    uniqueLogsMap.set(key, log)
                }
            }

            irrigations = Array.from(uniqueLogsMap.values()).sort(
                (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
            )
        }

        for (const irrigation of irrigations) {
            irrigation.landGroupTitle = await getLandGroupTitle(
                irrigation,
                irrigation.well,
                req.workspaceId
            )

            irrigation.totalReceivedWater = irrigation.duration
        }

        res.status(200).json({ irrigations })
    } catch (err) {
        console.error(err.message)

        res.status(500).json({
            message: 'خطا در دریافت لاگ‌های آبیاری!',
        })
    }
})

// POST create irrigation

router.post('/', async (req, res) => {
    try {
        const { landId, wellId, landGroupId, note } = req.body

        const currentUser = req.user

        const { startedAt, endedAt, isOngoing } =
            extractStartAndEndTimes(req.body)

        if (!wellId) {
            return res.status(400).json({
                message: 'شناسه چاه (wellId) الزامی است.',
            })
        }

        const wellDocument = await Well.findOne({
            _id: wellId,
            workspaceId: req.workspaceId,
        })

        if (!wellDocument) {
            return res.status(404).json({
                message: 'چاه پیدا نشد.',
            })
        }

        let landIdsToCheck = []

        if (landGroupId) {
            const groupDocument = wellDocument.landGroups.find(
                g => g.groupId.toString() === landGroupId
            )

            if (!groupDocument) {
                return res.status(404).json({
                    message: 'گروه پیدا نشد.',
                })
            }

            landIdsToCheck = groupDocument.lands.map(l => l.toString())
        } else {
            if (!landId) {
                return res.status(400).json({
                    message: 'شناسه زمین (landId) الزامی است.',
                })
            }

            const landDocument = await Land.findOne({
                _id: landId,
                workspaceId: req.workspaceId,
            })

            if (!landDocument) {
                return res.status(404).json({
                    message: 'زمین پیدا نشد.',
                })
            }

            landIdsToCheck = [landId.toString()]
        }

        const conflictMessage = await checkIrrigationConflict({
            wellId,
            landIds: landIdsToCheck,
            startedAt,
            endedAt,
            isOngoing,
            workspaceId: req.workspaceId,
        })

        if (conflictMessage) {
            return res.status(400).json({
                message: conflictMessage,
            })
        }

        const createdLogs = []

        for (const land of landIdsToCheck) {
            const created = await Irrigation.create({
                workspaceId: req.workspaceId,
                land,
                well: wellId,
                startedAt,
                endedAt,
                note,
                isOngoing,
                createdBy: currentUser._id,
                landGroup: landGroupId || null,
                isGroupLog: Boolean(landGroupId),
                duration: null,
            })

            createdLogs.push(created)

            await sendIrrigationNotificationToLandOwner({
                landId: land,
                irrigationDocument: created,
                endedAt,
                currentUser,
                workspaceId: req.workspaceId,
            })
        }

        const irrigation = await Irrigation.findOne({
            _id: createdLogs[0]._id,
            workspaceId: req.workspaceId,
        })
            .populate({
                path: 'land',
                populate: {
                    path: 'owner',
                    select: 'fullName mobile',
                },
                select: 'title owner',
            })
            .populate('well', 'title landGroups')
            .populate('createdBy', 'fullName mobile')
            .lean()

        irrigation.landGroupTitle = await getLandGroupTitle(
            irrigation,
            irrigation.well,
            req.workspaceId
        )

        return res.status(201).json({
            message: landGroupId
                ? 'آبیاری گروهی با موفقیت ثبت شد.'
                : 'آبیاری با موفقیت ثبت شد.',
            irrigation,
        })
    } catch (err) {
        console.error(err)

        if (err.name === 'ValidationError') {
            const firstError = Object.values(err.errors)[0]
            const fieldName =
                fieldTranslations.irrigations[firstError.path] ||
                firstError.path

            return res.status(400).json({
                message: `${fieldName} الزامی یا نامعتبر است.`,
            })
        }

        return res.status(500).json({
            message: 'خطا در ثبت آبیاری.',
        })
    }
})

// GET single irrigation

router.get('/:irrigationId', async (req, res) => {
    try {
        const { irrigationId } = req.params

        if (!mongoose.isValidObjectId(irrigationId)) {
            return res.status(400).json({
                message: 'شناسه آبیاری معتبر نیست.',
            })
        }

        const projection = getProjection(req)

        const irrigation = await Irrigation.findOne(
            {
                _id: irrigationId,
                workspaceId: req.workspaceId,
            },
            projection ?? undefined
        )
            .populate({
                path: 'land',
                populate: {
                    path: 'owner',
                    select: 'fullName mobile',
                },
                select: 'title owner',
            })
            .populate('well', 'title landGroups')
            .populate('createdBy', 'fullName mobile')
            .lean()

        if (!irrigation) {
            return res.status(404).json({
                message: 'آبیاری پیدا نشد.',
            })
        }

        irrigation.landGroupTitle = await getLandGroupTitle(
            irrigation,
            irrigation.well,
            req.workspaceId
        )

        irrigation.totalReceivedWater = irrigation.duration

        res.status(200).json({ irrigation })
    } catch (err) {
        console.error(err.message)

        res.status(500).json({
            message: 'خطای داخلی سرور.',
        })
    }
})

// PATCH update irrigation

router.patch('/:irrigationId', async (req, res) => {
    try {
        const { irrigationId } = req.params

        if (!mongoose.isValidObjectId(irrigationId)) {
            return res.status(400).json({
                message: 'شناسه آبیاری معتبر نیست.',
            })
        }

        const irrigationDocument = await Irrigation.findOne({
            _id: irrigationId,
            workspaceId: req.workspaceId,
        })

        if (!irrigationDocument) {
            return res.status(404).json({
                message: 'آبیاری پیدا نشد.',
            })
        }

        const currentUser = req.user

        const { startedAt, endedAt, isOngoing } =
            extractStartAndEndTimes(req.body)

        let landIdsToCheck = []

        if (irrigationDocument.landGroup) {
            const wellDocument = await Well.findOne({
                _id: irrigationDocument.well,
                workspaceId: req.workspaceId,
            })

            if (!wellDocument) {
                return res.status(404).json({
                    message: 'چاه پیدا نشد.',
                })
            }

            const groupDocument = wellDocument.landGroups.find(
                g =>
                    g.groupId.toString() ===
                    irrigationDocument.landGroup.toString()
            )

            if (!groupDocument) {
                return res.status(404).json({
                    message: 'گروه پیدا نشد.',
                })
            }

            landIdsToCheck = groupDocument.lands.map(l => l.toString())
        } else {
            const landDocument = await Land.findOne({
                _id: irrigationDocument.land,
                workspaceId: req.workspaceId,
            })

            if (!landDocument) {
                return res.status(404).json({
                    message: 'زمین پیدا نشد.',
                })
            }

            landIdsToCheck = [irrigationDocument.land.toString()]
        }

        const conflictMessage = await checkIrrigationConflict({
            wellId: irrigationDocument.well,
            landIds: landIdsToCheck,
            startedAt,
            endedAt,
            isOngoing,
            excludeId: irrigationDocument._id,
            workspaceId: req.workspaceId,
        })

        if (conflictMessage) {
            return res.status(400).json({
                message: conflictMessage,
            })
        }

        if (irrigationDocument.landGroup) {
            const groupDocuments = await Irrigation.find({
                workspaceId: req.workspaceId,
                well: irrigationDocument.well,
                landGroup: irrigationDocument.landGroup,
            })
                .populate({
                    path: 'land',
                    select: 'title',
                })
                .populate('well', 'title landGroups')
                .populate('createdBy', 'fullName mobile')

            await updateGroupIrrigationLogs({
                groupIrrigationDocuments: groupDocuments,
                requestBody: req.body,
                currentUser,
                workspaceId: req.workspaceId,
            })

            const refreshedGroup = await Irrigation.find({
                workspaceId: req.workspaceId,
                well: irrigationDocument.well,
                landGroup: irrigationDocument.landGroup,
            })
                .populate({
                    path: 'land',
                    select: 'title',
                })
                .populate('well', 'title landGroups')
                .populate('createdBy', 'fullName mobile')
                .lean()

            const representative = refreshedGroup[0]

            const lands = refreshedGroup.map(d => ({
                _id: d.land._id,
                title: d.land.title,
            }))

            const responseObject = {
                _id: representative._id,
                landGroup: representative.landGroup,
                landGroupTitle: await getLandGroupTitle(
                    representative,
                    representative.well,
                    req.workspaceId
                ),
                well: {
                    _id: representative.well._id,
                    title: representative.well.title,
                },
                lands,
                isGroupLog: true,
                startedAt: representative.startedAt,
                endedAt: representative.endedAt,
                duration: representative.duration,
                isOngoing: representative.isOngoing,
                createdBy: representative.createdBy,
            }

            return res.status(200).json({
                message: 'آبیاری گروهی ویرایش شد.',
                irrigation: responseObject,
            })
        }

        if (startedAt) irrigationDocument.startedAt = startedAt

        if (endedAt) irrigationDocument.endedAt = endedAt

        Object.entries(req.body).forEach(([fieldName, fieldValue]) => {
            if (
                ![
                    'startDate',
                    'startTime',
                    'endDate',
                    'endTime',
                    'createdBy',
                    'workspaceId',
                    'land',
                    'well',
                    'landGroup',
                    '_id',
                    'isGroupLog',
                ].includes(fieldName)
            ) {
                irrigationDocument[fieldName] = fieldValue
            }
        })

        irrigationDocument.isOngoing = isOngoing
        irrigationDocument.createdBy = currentUser._id

        await irrigationDocument.save()

        const updatedIrrigation = await Irrigation.findOne({
            _id: irrigationId,
            workspaceId: req.workspaceId,
        })
            .populate({
                path: 'land',
                populate: {
                    path: 'owner',
                    select: 'fullName mobile',
                },
                select: 'title owner',
            })
            .populate('well', 'title landGroups')
            .populate('createdBy', 'fullName mobile')
            .lean()

        updatedIrrigation.landGroupTitle = await getLandGroupTitle(
            updatedIrrigation,
            updatedIrrigation.well,
            req.workspaceId
        )

        updatedIrrigation.totalReceivedWater = updatedIrrigation.duration

        await sendIrrigationNotificationToLandOwner({
            landId: updatedIrrigation.land._id,
            irrigationDocument: updatedIrrigation,
            endedAt,
            currentUser,
            workspaceId: req.workspaceId,
        })

        return res.status(200).json({
            message: 'آبیاری با موفقیت ویرایش شد.',
            irrigation: updatedIrrigation,
        })
    } catch (err) {
        console.error(err)

        if (err.name === 'ValidationError') {
            const firstError = Object.values(err.errors)[0]

            const fieldName =
                fieldTranslations.irrigations[firstError.path] ||
                firstError.path

            return res.status(400).json({
                message: `${fieldName} الزامی یا نامعتبر است.`,
            })
        }

        return res.status(500).json({
            message: 'خطا در ویرایش آبیاری.',
        })
    }
})

// DELETE irrigation

router.delete('/:irrigationId', async (req, res) => {
    try {
        const { irrigationId } = req.params

        if (!mongoose.isValidObjectId(irrigationId)) {
            return res.status(400).json({
                message: 'شناسه آبیاری معتبر نیست.',
            })
        }

        const deletedIrrigation = await Irrigation.findOneAndDelete({
            _id: irrigationId,
            workspaceId: req.workspaceId,
        })

        if (!deletedIrrigation) {
            return res.status(404).json({
                message: 'آبیاری پیدا نشد.',
            })
        }

        return res.status(200).json({
            message: 'آبیاری با موفقیت حذف شد.',
        })
    } catch (err) {
        console.error(err)

        return res.status(500).json({
            message: 'خطای داخلی سرور.',
        })
    }
})

// Fallback for unsupported methods

router.all(/.*/, (req, res) => {
    res.status(405).json({
        error: 'Method Not Allowed',
    })
})

export default router