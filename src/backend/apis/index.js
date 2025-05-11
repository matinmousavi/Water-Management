import { Router } from 'express'
import jwt from 'jsonwebtoken'
import Cookies from 'cookies'

import otp from './otp/otp.routes.js'
import me from './me/me.routes.js'

const router = Router()

router.use((req, res, next) => {
	const cookies = new Cookies(req, res)
	const token = cookies.get('token')

	req.isAdmin = false
	req.isLogin = false

	console.log(token)

	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				return res.status(403).json({ message: 'شناسه نامعتبر' })
			} else {
				req.user = decoded
				req.isLogin = true
				req.isAdmin = decoded.roles.includes('admin')
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

router.use('/otp', otp)
router.use('/me', isLogin, me)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
