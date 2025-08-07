import express, { Router } from 'express'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

import { authMiddleware, isAdmin, isLogin } from '../middlewares/auth.js'

import otp from './otp/otp.js'
import me from './me/me.js'
import users from './users/users.js'
import upload from './upload/upload.js'
import wells from './wells/wells.js'
import lands from './lands/lands.js'
import irrigations from './irrigations/irrigations.js'
import notifications from './notifications/notifications.js'
import settings from './settings/settings.js'
import notes from './notes/notes.js'

const router = Router()

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
router.use('/notifications', isAdmin, notifications)
router.use('/settings', isLogin, settings)
router.use('/notes', isLogin, notes)

export default router
