import { Router } from 'express'

import User from '../../models/User.model.js'
import Well from '../../models/Well.model.js'
import Notification from '../../models/Notification.model.js'

import { getProjection } from '../../utils/queryUtils.js'
import sendSMS from '../../services/sendSMS.js'

const router = Router()

const notificationRepresentation = notification => ({
    id: notification._id,
    message: notification.message,
    medium: notification.medium,
    recipientGroup: notification.recipientGroup,
    recipients: notification.recipients,
    sentBy:
        notification.sentBy && {
            id: notification.sentBy._id,
            fullName: notification.sentBy.fullName,
        },
    sentAt: notification.sentAt,
    meta: {
        successCount: notification.meta?.successCount || 0,
        failCount: notification.meta?.failCount || 0,
    },
})

router.get('/', async (req, res) => {
    try {
        const projection = getProjection(req)

        const notifications = await Notification.find(
            { workspaceId: req.workspaceId },
            projection ?? undefined
        )
            .sort({ createdAt: -1 })
            .populate('sentBy', 'fullName')

        const data = notifications.map(notificationRepresentation)

        return res.status(200).json({ data })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            error: 'خطا در دریافت نوتیفیکیشن‌ها',
        })
    }
})

router.post('/', async (req, res) => {
    try {
        let { recipientGroup, message, medium, wellIds = [] } = req.body

        const sentBy = req.user?._id

        if (!sentBy) {
            return res.status(401).json({
                error: 'احراز هویت انجام نشده',
            })
        }

        if (!Array.isArray(recipientGroup)) {
            return res.status(400).json({
                error: 'recipientGroup باید یک آرایه باشد',
            })
        }

        const usersMap = new Map()

        if (wellIds.length > 0) {
            const wells = await Well.find({
                _id: { $in: wellIds },
                workspaceId: req.workspaceId,
            }).populate({
                path: 'lands',
                match: { workspaceId: req.workspaceId },
            })

            const irrigatorIds = new Set()
            const landOwnerIds = new Set()

            for (const well of wells) {
                if (well.irrigator) {
                    irrigatorIds.add(well.irrigator.toString())
                }

                for (const land of well.lands) {
                    if (land.owner) {
                        landOwnerIds.add(land.owner.toString())
                    }
                }
            }

            for (const group of recipientGroup) {
                let foundUsers = []

                switch (group) {
                    case 'irrigator':
                        foundUsers = await User.find({
                            _id: { $in: Array.from(irrigatorIds) },
                            workspaceId: req.workspaceId,
                        })
                        break

                    case 'landOwner':
                        foundUsers = await User.find({
                            _id: { $in: Array.from(landOwnerIds) },
                            workspaceId: req.workspaceId,
                        })
                        break

                    case 'all':
                        foundUsers = await User.find({
                            workspaceId: req.workspaceId,
                        })
                        break

                    default:
                        foundUsers = await User.find({
                            role: group,
                            workspaceId: req.workspaceId,
                        })
                        break
                }

                for (const user of foundUsers) {
                    usersMap.set(user._id.toString(), user)
                }
            }
        } else {
            for (const group of recipientGroup) {
                const foundUsers =
                    group === 'all'
                        ? await User.find({
                              workspaceId: req.workspaceId,
                          })
                        : await User.find({
                              role: group,
                              workspaceId: req.workspaceId,
                          })

                for (const user of foundUsers) {
                    usersMap.set(user._id.toString(), user)
                }
            }
        }

        const users = Array.from(usersMap.values())

        if (!users.length) {
            return res.status(404).json({
                error: 'هیچ کاربری برای این گروه‌ها پیدا نشد.',
            })
        }

        const recipients = users.map(user => user._id)

        let successCount = 0
        let failCount = 0

        if (medium === 'sms') {
            for (const user of users) {
                try {
                    await sendSMS({
                        to: user.mobile,
                        message,
                    })

                    successCount++
                } catch (err) {
                    console.error(
                        `❌ ارسال پیامک به ${user.mobile} ناموفق بود:`,
                        err.message
                    )

                    failCount++
                }
            }
        }

        const notification = await Notification.create({
            workspaceId: req.workspaceId,
            recipientGroup,
            recipients,
            message,
            medium,
            sentBy,
            meta: {
                successCount,
                failCount,
            },
        })

        const populated = await notification.populate(
            'sentBy',
            'fullName'
        )

        const data = notificationRepresentation(populated)

        return res.status(201).json({ data })
    } catch (err) {
        console.error(err)

        return res.status(500).json({
            error: 'خطا در ارسال پیام',
        })
    }
})

export default router