import { Router } from 'express'
import MessageTemplate from '../../models/messageTemplate.model.js'

const router = Router()

// GET all message templates
router.get('/', async (req, res) => {
	try {
		const templates = await MessageTemplate.find()

		res.json({ templates })
	} catch (err) {
		console.error(err.message)
		res.status(500).json({ message: 'خطا در دریافت پیام‌ها' })
	}
})

// GET a single message template by key
router.get('/:key', async (req, res) => {
	try {
		const { key } = req.params
		const template = await MessageTemplate.findOne({ key })

		if (!template) return res.status(404).json({ message: 'پیام مورد نظر پیدا نشد' })

		res.json({ template })
	} catch (err) {
		console.error(err.message)
		res.status(500).json({ message: 'خطا در دریافت پیام' })
	}
})

// PUT update message template by key
router.put('/:key', async (req, res) => {
	try {
		const { key } = req.params
		const { text, description, placeholders, type } = req.body

		const updated = await MessageTemplate.findOneAndUpdate({ key }, { $set: { text, description, placeholders, type } }, { new: true })

		if (!updated) {
			return res.status(404).json({ message: 'پیام مورد نظر پیدا نشد' })
		}

		res.json({ message: 'پیام با موفقیت به‌روزرسانی شد', template: updated })
	} catch (err) {
		console.error(err.message)

		if (err.code === 11000 && err.keyValue) {
			const duplicateField = Object.keys(err.keyValue)[0]
			return res.status(409).json({
				message: `مقدار وارد شده برای فیلد '${duplicateField}' قبلاً استفاده شده است.`,
			})
		}

		res.status(500).json({ message: 'خطا در به‌روزرسانی پیام' })
	}
})

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	res.status(405).json({ error: 'Method Not Allowed' })
})

export default router
