import { Router } from 'express'
import Setting from '../../models/Setting.model.js'

const router = Router()

router.get('/', async (req, res) => {
	try {
		const settings = await Setting.findOne().lean()
		if (!settings) return res.status(404).json({ error: 'تنظیمات یافت نشد' })
		return res.status(200).json({ data: settings.irrigationLog || {} })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

router.patch('/', async (req, res) => {
	try {
		const updates = req.body
		let settings = await Setting.findOne()

		if (!settings) {
			settings = new Setting({ irrigations: updates })
		} else {
			settings.irrigations = {
				...(settings.irrigations?.toObject?.() || {}),
				...updates,
			}
		}

		await settings.save()
		return res.status(200).json({ data: settings.irrigations })
	} catch (err) {
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

export default router
