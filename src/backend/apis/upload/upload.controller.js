import path from 'path'
import fs from 'fs'
import File from '../../models/File.model.js'
import User from '../../models/User.model.js'

export const uploadProfilePicture = async (req, res) => {
	try {
		const userId = req.params.userId || req.user._id
		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' })

		if (!req.files || !req.files.profilePicture) {
			return res.status(400).json({ message: 'فایلی برای آپلود ارسال نشده' })
		}

		const file = req.files.profilePicture

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
		if (!allowedTypes.includes(file.mimetype)) {
			return res.status(400).json({ message: 'فرمت فایل قابل قبول نیست' })
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
		await user.save()

		return res.status(200).json({
			message: 'تصویر پروفایل با موفقیت بارگذاری شد',
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
}

export const deleteProfilePicture = async (req, res) => {
	try {
		const userId = req.params.userId || req.user._id
		const user = await User.findById(userId).populate('profilePicture')

		if (!user) {
			return res.status(404).json({ message: 'کاربر یافت نشد' })
		}

		if (!user.profilePicture) {
			return res.status(400).json({ message: 'تصویر پروفایلی برای حذف وجود ندارد' })
		}

		const filePath = path.join('uploads', path.basename(user.profilePicture.url))
		fs.unlink(filePath, err => {
			if (err) console.warn('خطا در حذف فایل:', err)
		})

		await File.findByIdAndDelete(user.profilePicture._id)

		user.profilePicture = null
		await user.save()

		return res.status(200).json({ message: 'تصویر پروفایل با موفقیت حذف شد' })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
}
