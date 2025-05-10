import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

router.use((req, res, next) => {
	const token = req.headers['authorization']

	req.isAdmin = false
	req.isLogin = false

	if (token) {
		jwt.verify(token.substring(7), process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				return res.status(403).json({ message: 'شناسه نامعتبر' })
			} else {
				req.user = decoded
				req.isLogin = true
				req.isAdmin = decoded.role === 'admins'
			}
			next()
		})
	} else {
		next()
	}
})

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

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
