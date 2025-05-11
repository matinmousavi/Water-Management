import jwt from 'jsonwebtoken'
import User from '../../database/models/User.model.js'

const isProd = import.meta.env?.PROD

export async function getMe(req, res) {
	const token = req.cookies.token

	if (!token) {
		return res.status(401).json({ message: 'لطفاً وارد حساب کاربری خود شوید.' })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		const { mobile } = decoded

		const user = await User.findOne({ mobile })

		if (!user) {
			return res.status(404).json({ message: 'کاربر پیدا نشد.' })
		}

		return res.json({ user })
	} catch (err) {
		return res.status(401).json({ error: err, message: 'توکن معتبر نیست یا منقضی شده است.' })
	}
}

export const logout = (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		secure: isProd,
		sameSite: 'strict',
	})

	return res.json({ message: 'خروج با موفقیت انجام شد.' })
}
