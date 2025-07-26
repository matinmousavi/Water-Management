import { Router } from 'express'
import templates from './templates.js'

const router = Router()

router.use('/templates', templates)

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	res.status(405).json({ error: 'Method Not Allowed' })
})

export default router
