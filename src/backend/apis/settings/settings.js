import { Router } from 'express'
import Setting from '../../models/Setting.model.js'
import MessageTemplate from '../../models/messageTemplate.model.js'

import notifications from './notifications/notifications.js'

const router = Router()

// GET all global settings
router.get('/', async (req, res) => {
	try {
		const [settings, templates] = await Promise.all([Setting.findOne().lean(), MessageTemplate.find().lean()])

		if (!settings) return res.status(404).json({ error: 'Settings not found' })

		return res.status(200).json({
			settings,
			templates,
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: 'Server error', details: err.message })
	}
})

router.get('/irrigation-log', async (req, res) => {
	try {
		const settings = await Setting.findOne().lean()
		if (!settings) return res.status(404).json({ error: 'Global settings not found' })
		return res.status(200).json({ data: settings.irrigationLogSettings || {} })
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: err.message })
	}
})

// PUT update irrigation log settings
router.put('/irrigation-log', async (req, res) => {
	try {
		const updates = req.body
		let settings = await Setting.findOne()

		if (!settings) {
			settings = new Setting({ irrigationLogSettings: updates })
		} else {
			settings.irrigationLogSettings = {
				...settings.irrigationLogSettings,
				...updates,
			}
		}

		await settings.save()
		return res.status(200).json({ data: settings.irrigationLogSettings })
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: err.message })
	}
})

router.use('/notifications', notifications)

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	res.status(405).json({ error: 'Method Not Allowed' })
})

export default router
