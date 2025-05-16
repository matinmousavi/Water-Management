import { Router } from 'express'
import { uploadProfilePicture } from './upload.controller.js'

const router = Router()

router.post('/profile/picture', uploadProfilePicture)
router.post('/profile/picture/:userId', uploadProfilePicture)

export default router
