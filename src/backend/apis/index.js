import { Router } from 'express'

import { authMiddleware, isAdmin, isLogin } from '../middlewares/auth.js'

import otp from './otp/otp.routes.js'
import me from './me/me.routes.js'
import users from './users/users.routes.js'

const router = Router()

router.use(authMiddleware)

router.use('/otp', otp)
router.use('/me', isLogin, me)
router.use('/users', isAdmin, users)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
