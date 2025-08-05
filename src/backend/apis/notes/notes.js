import { Router } from 'express'
import Note from '../../models/Note.model.js'
import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'
import User from '../../models/User.model.js'

const router = Router()

// Get reference data for note
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

// GET all notes (optional filters: user, type, reference)
router.get('/', async (req, res) => {
	try {
		const { user, type, reference } = req.query
		const query = {}

		if (type) {
			if (!['personal', 'well', 'land'].includes(type)) {
				return res.status(400).json({ error: 'Invalid note type' })
			}
			query.type = type
		}

		if (user) query.user = user
		if (reference) query.reference = reference

		const notes = await Note.find(query).sort({ createdAt: -1 }).lean()

		const processedNotes = await Promise.all(
			notes.map(async note => ({
				id: note._id,
				text: note.text,
				type: note.type,
				createdAt: note.createdAt,
				updatedAt: note.updatedAt,
				reference: await getReference(note.type, note.reference),
			}))
		)

		return res.status(200).json({ notes: processedNotes })
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: err.message })
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
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

// GET notes for a specific user (with access control)
router.get('/user/:userId', async (req, res) => {
	try {
		const { userId } = req.params

		if (!req.isAdmin && req.user._id.toString() !== userId) {
			return res.status(403).json({ error: 'دسترسی غیرمجاز' })
		}

		const notes = await Note.find({ user: userId }).sort({ createdAt: -1 }).lean()

		const processedNotes = await Promise.all(
			notes.map(async note => ({
				id: note._id,
				text: note.text,
				type: note.type,
				createdAt: note.createdAt,
				updatedAt: note.updatedAt,
				reference: await getReference(note.type, note.reference),
			}))
		)

		return res.status(200).json({ notes: processedNotes })
	} catch (err) {
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

// GET single note
router.get('/:id', async (req, res) => {
	try {
		const note = await Note.findById(req.params.id).lean()
		if (!note) {
			return res.status(404).json({ error: 'Note not found' })
		}

		const responseData = {
			id: note._id,
			text: note.text,
			type: note.type,
			createdAt: note.createdAt,
			updatedAt: note.updatedAt,
			reference: await getReference(note.type, note.reference),
		}

		return res.status(200).json({ note: responseData })
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: err.message })
	}
})

// PATCH update a note
router.patch('/:id', async (req, res) => {
	try {
		const { text } = req.body

		if (typeof text !== 'string' || !text.trim()) {
			return res.status(400).json({ error: 'متن یادداشت معتبر نیست' })
		}

		const updatedNote = await Note.findByIdAndUpdate(req.params.id, { text: text.trim() }, { new: true, runValidators: true }).lean()

		if (!updatedNote) {
			return res.status(404).json({ error: 'یادداشت پیدا نشد' })
		}

		const responseData = {
			id: updatedNote._id,
			text: updatedNote.text,
			type: updatedNote.type,
			createdAt: updatedNote.createdAt,
			updatedAt: updatedNote.updatedAt,
			reference: await getReference(updatedNote.type, updatedNote.reference),
		}

		return res.status(200).json({ note: responseData })
	} catch (err) {
		return res.status(500).json({ error: 'خطای سرور', details: err.message })
	}
})

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
