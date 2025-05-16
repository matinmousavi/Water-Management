import { Router } from 'expresss'
import { uploadProfilePicture } from './upload.controller.js'

const router = Router()

router.use('/profile/picture', uploadProfilePicture)

export default router
