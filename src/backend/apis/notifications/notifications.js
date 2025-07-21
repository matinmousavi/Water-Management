import { Router } from 'express'
import User from '../../models/User.model.js'
import Notification from '../../models/Notification.model.js'

const router = Router()

const notificationRepresentation = notification => ({
	id: notification._id,
	message: notification.message,
	medium: notification.medium,
	recipientGroup: notification.recipientGroup,
	recipients: notification.recipients,
	sentBy: notification.sentBy && {
		id: notification.sentBy._id,
		fullName: `${notification.sentBy.firstName} ${notification.sentBy.lastName}`,
	},
	sentAt: notification.sentAt,
	meta: {
		successCount: notification.meta?.successCount || 0,
		failCount: notification.meta?.failCount || 0,
	},
})

router.get('/', async (req, res) => {
	try {
		const notifications = await Notification.find().sort({ createdAt: -1 }).populate('sentBy', 'firstName lastName')

		const data = notifications.map(notificationRepresentation)

		res.status(200).json({
			data,
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({
			error: 'خطا در دریافت نوتیفیکیشن‌ها',
		})
	}
})

router.post('/', async (req, res) => {
	try {
		const { recipientGroup, message, medium } = req.body
		const sentBy = req.user?._id

		if (!sentBy) {
			return res.status(401).json({ error: 'احراز هویت انجام نشده' })
		}

		const roleFilter = recipientGroup === 'all' ? {} : { role: recipientGroup }
		const users = await User.find(roleFilter)

		if (!users.length) {
			return res.status(404).json({ error: 'هیچ کاربری برای این گروه پیدا نشد.' })
		}

		const recipients = users.map(user => user._id)

		const notification = await Notification.create({
			recipientGroup,
			recipients,
			message,
			medium,
			sentBy,
			meta: {
				successCount: recipients.length,
				failCount: 0,
			},
		})

		const populated = await notification.populate('sentBy', 'firstName lastName')
		const data = notificationRepresentation(populated)

		res.status(201).json({
			data,
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'خطا در ارسال پیام' })
	}
})

export default router
