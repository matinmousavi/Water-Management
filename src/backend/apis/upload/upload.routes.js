import { Router } from 'express'
import { uploadProfilePicture } from './upload.controller.js'
import { isAdmin } from '../../middlewares/auth.js'

const router = Router()

router.post('/profile/picture', uploadProfilePicture)
router.post('/profile/picture/:userId', isAdmin, uploadProfilePicture)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
