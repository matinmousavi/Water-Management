import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import File from '../../models/File.model.js'
import User from '../../models/User.model.js'
import { fieldTranslations } from '../../constants/fieldTranslations.js'
import { sanitizeQuery } from '../../utils/sanitizeQuery.js'

const router = Router()

const deleteFile = async fileDoc => {
	if (fileDoc) {
		const filePath = path.join('uploads', path.basename(fileDoc.url))
		fs.unlink(filePath, err => {
			if (err) console.warn('⚠️ خطا در حذف فایل:', err)
		})
		await File.findByIdAndDelete(fileDoc._id)
	}
}

// GET all users with optional filters
router.get('/', async (req, res) => {
	try {
		const safeQuery = sanitizeQuery(req.query)
		const filter = {}

		const allowedFields = ['role', 'firstName', 'lastName', 'mobile', 'email', 'address', 'accountingCode']

		allowedFields.forEach(field => {
			if (safeQuery[field]) {
				filter[field] = { $regex: `^${safeQuery[field]}$`, $options: 'i' }
			}
		})

		const users = await User.find(filter).populate('profilePicture').lean()
		return res.status(200).json({ users })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در دریافت اطلاعات کاربران!' })
	}
})

// POST create a new user
router.post('/', async (req, res) => {
	try {
		const { role, firstName, lastName, mobile, email, accountingCode, address } = req.body

		let profilePictureId = null

		if (req.files?.image) {
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

			profilePictureId = savedFile._id
		}

		const user = await User.create({
			role,
			firstName,
			lastName,
			mobile,
			email,
			accountingCode,
			address,
			profilePicture: profilePictureId,
		})

		return res.status(201).json({ message: 'کاربر با موفقیت ایجاد شد.', user })
	} catch (err) {
		console.error(err.message)

		if (req.files?.image) {
			const fileName = `${Date.now()}_${req.files.image.name}`
			const filePath = path.join('uploads', fileName)
			if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
			await File.deleteOne({ name: req.files.image.name })
		}

		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations.users[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations.users[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی است.` })
		}

		return res.status(500).json({ message: 'خطا در ایجاد کاربر.' })
	}
})

// GET a single user by ID
router.get('/:userId', async (req, res) => {
	try {
		const { userId } = req.params
		const user = await User.findById(userId).populate('profilePicture')
		if (!user) {
			return res.status(404).json({ message: 'کاربر پیدا نشد.' })
		}
		return res.status(200).json({ user })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور' })
	}
})

// PATCH update a user by ID
router.patch('/:userId', async (req, res) => {
	try {
		const { userId } = req.params
		const updates = req.body

		const user = await User.findById(userId).populate('profilePicture')
		if (!user) {
			return res.status(404).json({ message: 'کاربر پیدا نشد.' })
		}

		if (req.files?.image) {
			const file = req.files.image
			const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

			if (!allowedTypes.includes(file.mimetype)) {
				return res.status(400).json({ message: 'فرمت تصویر معتبر نیست.' })
			}

			if (user.profilePicture) {
				await deleteFile(user.profilePicture)
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

			user.profilePicture = savedFile._id
		} else if (updates.profilePicture === null && user.profilePicture) {
			await deleteFile(user.profilePicture)
			user.profilePicture = null
		}

		Object.assign(user, updates)
		await user.save()

		return res.status(200).json({ message: 'کاربر با موفقیت ویرایش شد.', user })
	} catch (err) {
		console.error(err.message)

		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations.users[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations.users[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی است.` })
		}

		return res.status(500).json({ message: 'خطای داخلی سرور' })
	}
})

// DELETE a user by ID
router.delete('/:userId', async (req, res) => {
	try {
		const { userId } = req.params

		const user = await User.findById(userId).populate('profilePicture')
		if (!user) {
			return res.status(404).json({ message: 'کاربر پیدا نشد.' })
		}

		if (user.profilePicture) {
			await deleteFile(user.profilePicture)
		}

		await User.findByIdAndDelete(userId)

		return res.status(200).json({ message: 'کاربر با موفقیت حذف شد.' })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور' })
	}
})

// Fallback for unsupported HTTP methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
