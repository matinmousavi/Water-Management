import { Router } from 'express'
import { getMe } from './me.controller.js'

const router = Router()

router.get('/', getMe)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
