import { Router } from 'express'
import Setting from '../../../models/Setting.model.js'
import { getProjection } from '../../../utils/queryUtils.js'

const router = Router()

// GET all message templates
router.get('/', async (req, res) => {
	try {
		const projection = getProjection(req)
		if (projection) {
			projection.messageTemplates = 1
		}
		const setting = await Setting.findOne({}, projection ?? undefined).lean()
		res.json({ templates: setting?.messageTemplates || [] })
	} catch (err) {
		console.error(err.message)
		res.status(500).json({ message: 'خطا در دریافت پیام‌ها' })
	}
})

// GET a single message template by key
router.get('/:key', async (req, res) => {
	try {
		const { key } = req.params
		const projection = getProjection(req)
		if (projection) {
			projection.messageTemplates = 1
		}
		const setting = await Setting.findOne({}, projection ?? undefined).lean()
		const template = setting?.messageTemplates?.find(t => t.key === key)

		if (!template) {
			return res.status(404).json({ message: 'پیام مورد نظر پیدا نشد' })
		}

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
		const { text, title, placeholders, type } = req.body

		const setting = await Setting.findOne()

		if (!setting || !Array.isArray(setting.messageTemplates)) {
			return res.status(404).json({ message: 'تنظیمات یا پیام‌ها پیدا نشدند' })
		}

		const index = setting.messageTemplates.findIndex(t => t.key === key)

		if (index === -1) {
			return res.status(404).json({ message: 'پیام مورد نظر پیدا نشد' })
		}

		if (text !== undefined) setting.messageTemplates[index].text = text
		if (title !== undefined) setting.messageTemplates[index].title = title
		if (placeholders !== undefined) setting.messageTemplates[index].placeholders = placeholders
		if (type !== undefined) setting.messageTemplates[index].type = type

		await setting.save()

		res.json({
			message: 'پیام با موفقیت به‌روزرسانی شد',
			template: setting.messageTemplates[index],
		})
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
