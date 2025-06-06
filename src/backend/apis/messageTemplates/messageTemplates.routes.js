import { Router } from 'express'
import { getAllTemplates, getTemplateByKey, updateTemplateByKey } from './messageTemplates.controller.js'

const router = Router()

router.get('/', getAllTemplates)
router.get('/:key', getTemplateByKey)
router.put('/:key', updateTemplateByKey)

router.all(/.*/, (req, res) => {
	res.status(405).json({ error: 'Method Not Allowed' })
})

export default router
