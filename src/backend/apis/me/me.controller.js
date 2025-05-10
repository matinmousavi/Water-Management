import User from '../../database/models/Users.model.js'

export async function getMe(req, res) {
	try {
		const user = await User.findById(req.user._id).select('+password')
		if (user) {
			const hasPassword = !!user.password
			res.send({ ...user.toObject(), hasPassword })
		} else {
			res.status(403).json({ message: 'شناسه نامعتبر' })
		}
	} catch (error) {
		res.status(500).send({ message: 'خطا در دریافت اطلاعات کاربر', error })
	}
}
