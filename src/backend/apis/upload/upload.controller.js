import path from 'path'
import File from '../../database/models/File.model.js'
import User from '../../database/models/User.model.js'

export const uploadProfilePicture = async (req, res) => {
	try {
		const userId = req.user._id
		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' })

		if (!req.files || !req.files.profilePicture) return res.status(400).json({ message: 'فایلی برای آپلود ارسال نشده' })

		const file = req.files.profilePicture

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
		if (!allowedTypes.includes(file.mimetype)) return res.status(400).json({ message: 'فرمت فایل قابل قبول نیست' })

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
