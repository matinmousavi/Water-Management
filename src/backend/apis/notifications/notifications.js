import { Router } from 'express'
import User from '../../models/User.model.js'
import sendSMS from '../../../services/sendSMS.js'

const router = Router()

// POST send broadcast message
router.post('/broadcast', async (req, res) => {
	try {
		const { text } = req.body
		if (!text || !text.trim()) {
			return res.status(400).json({ message: 'متن پیام نمی‌تواند خالی باشد' })
		}

		const users = await User.find({ status: 'active' }, 'firstName lastName mobile')

		let successCount = 0
		let failCount = 0
		const results = []

		for (const user of users) {
			if (!user.mobile) continue

			try {
				await sendSMS({ to: user.mobile, message: text })
				successCount++
			} catch (err) {
				console.error(`❌ ارسال پیامک به ${user.mobile} ناموفق بود:`, err.message)
				failCount++
				results.push({ mobile: user.mobile, error: err.message })
			}
		}

		res.json({
			message: `پیام به ${successCount} کاربر ارسال شد.`,
			failures: failCount,
			errors: results,
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'خطا در ارسال پیام همگانی' })
	}
})

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	res.status(405).json({ error: 'Method Not Allowed' })
})

export default router
