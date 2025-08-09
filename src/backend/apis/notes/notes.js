import { Router } from 'express'
import Note from '../../models/Note.model.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import User from '../../models/User.model.js'
import { pickFields } from '../../utils/pickFields.js'
import { sanitizeQuery } from '../../utils/sanitizeQuery.js'

const router = Router()

// Helper: Get reference data for note
const getReference = async (type, refId) => {
	if (!type || !refId) return null

	const models = {
		land: { model: Land, fields: 'title' },
		well: { model: Well, fields: 'title' },
		personal: { model: User, fields: 'fullName' },
	}

	const config = models[type]
	if (!config) return null

	const doc = await config.model.findById(refId).select(config.fields).lean()
	if (!doc) return null

	if (type === 'personal') {
		return { id: refId, fullName: doc.fullName }
	}
	return { id: refId, title: doc.title }
}

// GET all notes with filters and fields
router.get('/', async (req, res) => {
	try {
		const safeQuery = sanitizeQuery(req.query)
		const { filters, fields } = safeQuery

		let filterObj = {}
		if (filters) {
			try {
				filterObj = JSON.parse(filters)
			} catch {
				return res.status(400).json({ error: 'پارامتر filters نامعتبر است.' })
			}
		}

		const allowedFilterFields = ['type', 'user', 'reference']
		const mongoFilter = {}

		Object.entries(filterObj).forEach(([key, value]) => {
			if (allowedFilterFields.includes(key)) {
				mongoFilter[key] = value
			}
		})

		const projection = fields ? fields.replace(/,/g, ' ') : ''

		let notes = await Note.find(mongoFilter).select(projection).populate('user', 'fullName').sort({ createdAt: -1 }).lean()

		notes = await Promise.all(
			notes.map(async note => ({
				...note,
				reference: await getReference(note.type, note.reference),
			}))
		)

		return res.status(200).json({ notes: notes.map(note => pickFields(note, fields)) })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ error: 'خطا در دریافت یادداشت‌ها.' })
	}
})

// POST create a new note
router.post('/', async (req, res) => {
	try {
		const { text, type, reference } = req.body

		if (!text || typeof text !== 'string') {
			return res.status(400).json({ error: 'متن یادداشت الزامی است' })
		}

		if (!['personal', 'well', 'land'].includes(type)) {
			return res.status(400).json({ error: 'نوع یادداشت معتبر نیست' })
		}

		if (!reference) {
			return res.status(400).json({ error: 'شناسه مرجع الزامی است' })
		}

		const typeRefMap = {
			well: 'Well',
			land: 'Land',
			personal: 'User',
		}

		const note = await Note.create({
			user: req.user._id,
			type,
			reference,
			typeRef: typeRefMap[type],
			text: text.trim(),
		})

		const refData = await getReference(type, reference)

		const responseData = {
			id: note._id,
			text: note.text,
			type: note.type,
			createdAt: note.createdAt,
			updatedAt: note.updatedAt,
			reference: refData,
			user: { id: req.user._id, fullName: req.user.fullName },
		}

		return res.status(201).json({ note: responseData })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

// GET single note by ID, with optional fields
router.get('/:noteId', async (req, res) => {
	try {
		const { fields } = req.query
		const projection = fields ? fields.replace(/,/g, ' ') : ''

		let note = await Note.findById(req.params.id).select(projection).populate('user', 'fullName').lean()

		if (!note) {
			return res.status(404).json({ error: 'یادداشت پیدا نشد.' })
		}

		note.reference = await getReference(note.type, note.reference)

		return res.status(200).json({ note: pickFields(note, fields) })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: 'خطا در دریافت یادداشت.' })
	}
})

// PATCH update a note
router.patch('/:noteId', async (req, res) => {
	try {
		const { text } = req.body

		if (typeof text !== 'string' || !text.trim()) {
			return res.status(400).json({ error: 'متن یادداشت معتبر نیست' })
		}

		const note = await Note.findById(req.params.noteId).populate('user', 'fullName')
		if (!note) {
			return res.status(404).json({ error: 'یادداشت پیدا نشد' })
		}

		if (!req.isAdmin && note.user._id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ error: 'شما اجازه ویرایش این یادداشت را ندارید' })
		}

		note.text = text.trim()
		await note.save()

		const responseData = {
			id: note._id,
			text: note.text,
			type: note.type,
			createdAt: note.createdAt,
			updatedAt: note.updatedAt,
			reference: await getReference(note.type, note.reference),
			user: { id: note.user._id, fullName: note.user.fullName },
		}

		return res.status(200).json({ note: responseData })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

// DELETE remove a note
router.delete('/:noteId', async (req, res) => {
	try {
		const note = await Note.findById(req.params.noteId)
		if (!note) {
			return res.status(404).json({ error: 'یادداشت پیدا نشد' })
		}

		if (!req.isAdmin && note.user.toString() !== req.user._id.toString()) {
			return res.status(403).json({ error: 'شما اجازه حذف این یادداشت را ندارید' })
		}

		await note.deleteOne()

		return res.status(200).json({ message: 'یادداشت با موفقیت حذف شد' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
