import { Router } from 'express'
import path from 'path'
import File from '../../models/File.model.js'

const router = Router()

// POST upload a single image and return its URL
router.post('/image', async (req, res) => {
	try {
		if (!req.files || !req.files.image) {
			return res.status(400).json({ message: 'فایل تصویر آپلود نشده است.' })
		}

		const file = req.files.image
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

		if (!allowedTypes.includes(file.mimetype)) {
			return res.status(400).json({ message: 'فرمت تصویر معتبر نیست.' })
		}

		const fileName = `${Date.now()}_${file.name}`
		const uploadPath = path.join('uploads', fileName)
		const uploadUrl = `/uploads/${fileName}`

		await file.mv(uploadPath)

		const savedFile = await File.create({
			name: file.name,
			md5: file.md5,
			mimetype: file.mimetype,
			size: file.size,
			url: uploadUrl,
		})

		return res.status(200).json({
			message: 'تصویر با موفقیت آپلود شد.',
			url: savedFile.url,
			id: savedFile._id,
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
})

// Fallback for unsupported HTTP methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
