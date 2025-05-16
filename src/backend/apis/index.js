import express, { Router } from 'express'

import { authMiddleware, isAdmin, isLogin } from '../middlewares/auth.js'

import otp from './otp/otp.routes.js'
import me from './me/me.routes.js'
import users from './users/users.routes.js'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

const isProd = import.meta.env?.PROD
const router = Router()

if (!isProd) {
	morgan.token('req-length', req => req.headers['content-length'] || '0')
	morgan.token('res-length', (req, res) => res.getHeader('content-length') || '0')

	const morganFormat = ':method :url :status - req: :req-length bytes - res: :res-length bytes - :response-time ms'

	router.use(morgan(morganFormat))
}

router.use(cookieParser())

router.use(express.json())

router.use(
	fileUpload({
		createParentPath: true,
		limits: { fileSize: 5 * 1024 * 1024 },
		useTempFiles: true,
		tempFileDir: '/tmp/',
	})
)

router.use(authMiddleware)

router.use('/otp', otp)
router.use('/me', isLogin, me)
router.use('/users', isAdmin, users)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
