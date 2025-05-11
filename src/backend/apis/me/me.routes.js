import { Router } from 'express'
import { getMe, logout } from './me.controller.js'

const router = Router()

router.get('/', getMe)
router.get('/logout', logout)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
