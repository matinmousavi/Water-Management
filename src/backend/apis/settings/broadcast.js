import { Router } from 'express'
import User from '../../models/User.model.js'
import sendSMS from '../../../services/sendSMS.js'

const router = Router()

router.post('/', async (req, res) => {
	try {
		const { text } = req.body
		if (!text?.trim()) {
			return res.status(400).json({ message: 'متن پیام نمی‌تواند خالی باشد' })
		}

		const users = await User.find({ status: 'active' }, 'firstName lastName mobile')
		let successCount = 0,
			failCount = 0
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

export default router
