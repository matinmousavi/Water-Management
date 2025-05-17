import { Router } from 'express'
import { deleteProfilePicture, uploadProfilePicture } from './upload.controller.js'
import { isAdmin } from '../../middlewares/auth.js'

const router = Router()

router.post('/profile/picture', uploadProfilePicture)
router.delete('/profile/picture', deleteProfilePicture)

router.post('/profile/picture/:userId', isAdmin, uploadProfilePicture)
router.delete('/profile/picture/:userId', deleteProfilePicture)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
