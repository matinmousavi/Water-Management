import { Router } from 'express'
import { sendOtp, verifyOtp } from './otp.controller.js'

const router = Router()

router.post('/send', sendOtp)
router.post('/verify', verifyOtp)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
