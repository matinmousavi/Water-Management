import { Router } from 'express'
import Setting from '../../models/Setting.model.js'
import { getProjection } from '../../utils/queryUtils.js'
import irrigations from './irrigations.js'
import notifications from './notifications/notifications.js'

const router = Router()

// GET all global settings + templates
router.get('/', async (req, res) => {
	try {
                const projection = getProjection(req)
                const settings = await Setting.findOne({}, projection ?? undefined).lean()
		if (!settings) return res.status(404).json({ error: 'تنظیمات یافت نشد' })
		return res.status(200).json({ settings })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

router.use('/irrigations', irrigations)
router.use('/notifications', notifications)

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	res.status(405).json({ error: 'Method Not Allowed' })
})

export default router
