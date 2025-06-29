import express, { Router } from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

import { authMiddleware, isAdmin, isLogin } from '../middlewares/auth.js'

import otp from './otp/otp.routes.js'
import me from './me/me.routes.js'
import users from './users/users.js'
import upload from './upload/upload.routes.js'
import wells from './wells/wells.routes.js'
import lands from './lands/lands.routes.js'
import irrigations from './irrigations/irrigations.routes.js'
import messageTemplates from './messageTemplates/messageTemplates.js'

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
router.use('/upload', isLogin, upload)
router.use('/wells', isLogin, wells)
router.use('/lands', isLogin, lands)
router.use('/irrigations', isLogin, irrigations)
router.use('/messageTemplates', isAdmin, messageTemplates)

export default router
