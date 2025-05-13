import jwt from 'jsonwebtoken'
import User from '../database/models/User.model.js'

export async function authMiddleware(req, res, next) {
	const token = req.cookies?.token

	if (!token) {
		req.user = null
		req.isLogin = false
		return next()
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findOne({ mobile: decoded.mobile })

		if (!user) {
			req.user = null
			req.isLogin = false
			return next()
		}

		req.user = user
		req.isLogin = true
		req.isAdmin = user.roles === 'admin'
		next()
	} catch {
		req.user = null
		req.isLogin = false
		next()
	}
}

export function isLogin(req, res, next) {
	if (!req.isLogin) {
		return res.status(401).json({ message: 'دسترسی غیرمجاز' })
	}
	next()
}

export function isAdmin(req, res, next) {
	isLogin(req, res, () => {
		if (!req.isAdmin) {
			return res.status(406).json({ message: 'دسترسی ممنوع' })
		}
		next()
	})
}
