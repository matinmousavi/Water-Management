import { Router } from 'express'

import Schedule from '../../models/Schedule.model.js'
import ScheduleSnapshot from '../../models/ScheduleSnapshot.model.js'
import Well from '../../models/Well.model.js'
import { getProjection } from '../../utils/queryUtils.js'

const router = Router({ mergeParams: true })

router.get('/', async (req, res) => {
    try {
        const { wellId } = req.params

        const well = await Well.findOne({
            _id: wellId,
            workspaceId: req.workspaceId,
        }).lean()

        if (!well) {
            return res.status(404).json({
                message: 'چاه پیدا نشد.',
            })
        }

        const projection = getProjection(req)

        const snapshots =
            await ScheduleSnapshot.find(
                {
                    workspaceId:
                        req.workspaceId,
                    well: wellId,
                },
                projection ?? undefined
            ).lean()

        return res.status(200).json({
            snapshots,
        })
    } catch (err) {
        console.error(err)

        return res.status(500).json({
            message:
                'خطا در دریافت اسنپ‌شات‌ها.',
        })
    }
})

router.post('/', async (req, res) => {
    try {
        const { wellId } = req.params
        const { title, description } =
            req.body

        const well = await Well.findOne({
            _id: wellId,
            workspaceId: req.workspaceId,
        }).lean()

        if (!well) {
            return res.status(404).json({
                message: 'چاه پیدا نشد.',
            })
        }

        if (!title?.trim()) {
            return res.status(400).json({
                message:
                    'عنوان اسنپ‌شات الزامی است.',
            })
        }

        const schedules =
            await Schedule.find({
                workspaceId:
                    req.workspaceId,
                well: wellId,
            }).lean()

        if (!schedules.length) {
            return res.status(400).json({
                message:
                    'هیچ زمان‌بندی فعالی برای ذخیره وجود ندارد.',
            })
        }

        const snapshot =
            await ScheduleSnapshot.create({
                workspaceId:
                    req.workspaceId,
                well: wellId,
                title,
                description,
                schedules:
                    schedules.map(s => ({
                        targetType:
                            s.targetType,
                        land: s.land,
                        landGroup:
                            s.landGroup,
                        startTime:
                            s.startTime.toISOString(),
                        endTime:
                            s.endTime.toISOString(),
                        title: s.title,
                        day: s.day,
                        color:
                            s.color || null,
                    })),
            })

        return res.status(201).json({
            message:
                'اسنپ‌شات ذخیره شد.',
            snapshot,
        })
    } catch (err) {
        console.error(err)

        return res.status(500).json({
            message:
                'خطا در ایجاد اسنپ‌شات.',
        })
    }
})

router.post(
    '/:snapshotId/restore',
    async (req, res) => {
        try {
            const {
                wellId,
                snapshotId,
            } = req.params

            const well = await Well.findOne({
                _id: wellId,
                workspaceId: req.workspaceId,
            }).lean()

            if (!well) {
                return res.status(404).json({
                    message:
                        'چاه پیدا نشد.',
                })
            }

            const snapshot =
                await ScheduleSnapshot.findOne({
                    _id: snapshotId,
                    workspaceId:
                        req.workspaceId,
                    well: wellId,
                })

            if (!snapshot) {
                return res.status(404).json({
                    message:
                        'اسنپ‌شات پیدا نشد.',
                })
            }

            await Schedule.deleteMany({
                workspaceId:
                    req.workspaceId,
                well: wellId,
            })

            const schedulesToInsert =
                snapshot.schedules.map(
                    s => ({
                        workspaceId:
                            req.workspaceId,
                        well: wellId,
                        targetType:
                            s.targetType,
                        land: s.land,
                        landGroup:
                            s.landGroup,
                        startTime:
                            new Date(
                                s.startTime
                            ),
                        endTime:
                            new Date(
                                s.endTime
                            ),
                        title: s.title,
                        color: s.color,
                        day: s.day,
                        status: 'active',
                    })
                )

            await Schedule.insertMany(
                schedulesToInsert
            )

            return res.status(200).json({
                message:
                    'زمان‌بندی‌ها با موفقیت بازگردانی شدند.',
            })
        } catch (err) {
            console.error(err)

            return res.status(500).json({
                message:
                    'خطا در بازگردانی اسنپ‌شات.',
            })
        }
    }
)

export default router