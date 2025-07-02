import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import File from '../../models/File.model.js'
import User from '../../models/User.model.js'
import { isAdmin } from '../../middlewares/auth.js'

const router = Router()

// POST upload current user's profile picture
router.post('/profile/picture', async (req, res) => {
	try {
		const userId = req.user._id
		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: 'User not found' })

		// Check that a file was sent
		if (!req.files || !req.files.profilePicture) {
			return res.status(400).json({ message: 'No file uploaded' })
		}

		const file = req.files.profilePicture
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
		// Validate MIME type
		if (!allowedTypes.includes(file.mimetype)) {
			return res.status(400).json({ message: 'Invalid file format' })
		}

		// Generate unique filename and paths
		const fileName = `${Date.now()}_${file.name}`
		const uploadPath = path.join('uploads', fileName)
		const uploadUrl = `/uploads/${fileName}`

		// Move file to uploads folder
		await file.mv(uploadPath)

		// Save file record in database
		const savedFile = await File.create({
			name: file.name,
			md5: file.md5,
			mimetype: file.mimetype,
			size: file.size,
			url: uploadUrl,
		})

		// Link file to user profile
		user.profilePicture = savedFile._id
		await user.save()

		return res.status(200).json({ message: 'Profile picture uploaded successfully' })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
})

// DELETE remove current user's profile picture
router.delete('/profile/picture', async (req, res) => {
	try {
		const userId = req.user._id
		const user = await User.findById(userId).populate('profilePicture')

		if (!user) return res.status(404).json({ message: 'User not found' })
		if (!user.profilePicture) {
			return res.status(400).json({ message: 'No profile picture to delete' })
		}

		// Delete file from disk
		const filePath = path.join('uploads', path.basename(user.profilePicture.url))
		fs.unlink(filePath, err => {
			if (err) console.warn('Error deleting file:', err)
		})

		// Remove file record and unlink from user
		await File.findByIdAndDelete(user.profilePicture._id)
		user.profilePicture = null
		await user.save()

		return res.status(200).json({ message: 'Profile picture deleted successfully' })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
})

// POST upload any user's profile picture (admin only)
router.post('/profile/picture/:userId', isAdmin, async (req, res) => {
	try {
		const userId = req.params.userId
		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: 'User not found' })

		// Check that a file was sent
		if (!req.files || !req.files.profilePicture) {
			return res.status(400).json({ message: 'No file uploaded' })
		}

		const file = req.files.profilePicture
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
		// Validate MIME type
		if (!allowedTypes.includes(file.mimetype)) {
			return res.status(400).json({ message: 'Invalid file format' })
		}

		// Generate unique filename and paths
		const fileName = `${Date.now()}_${file.name}`
		const uploadPath = path.join('uploads', fileName)
		const uploadUrl = `/uploads/${fileName}`

		// Move file to uploads folder
		await file.mv(uploadPath)

		// Save file record in database
		const savedFile = await File.create({
			name: file.name,
			md5: file.md5,
			mimetype: file.mimetype,
			size: file.size,
			url: uploadUrl,
		})

		// Link file to user profile
		user.profilePicture = savedFile._id
		await user.save()

		return res.status(200).json({ message: 'Profile picture uploaded successfully' })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
})

// DELETE remove any user's profile picture (admin only)
router.delete('/profile/picture/:userId', isAdmin, async (req, res) => {
	try {
		const userId = req.params.userId
		const user = await User.findById(userId).populate('profilePicture')

		if (!user) return res.status(404).json({ message: 'User not found' })
		if (!user.profilePicture) {
			return res.status(400).json({ message: 'No profile picture to delete' })
		}

		// Delete file from disk
		const filePath = path.join('uploads', path.basename(user.profilePicture.url))
		fs.unlink(filePath, err => {
			if (err) console.warn('Error deleting file:', err)
		})

		// Remove file record and unlink from user
		await File.findByIdAndDelete(user.profilePicture._id)
		user.profilePicture = null
		await user.save()

		return res.status(200).json({ message: 'Profile picture deleted successfully' })
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
