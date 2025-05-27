import { Router } from 'express'
import { createIrrigation, deleteIrrigation, getIrrigation, getIrrigations, updateIrrigation } from './irrigations.controller.js'

const router = Router()

router.get('/', getIrrigations)
router.post('/', createIrrigation)

router.get('/:irrigationId', getIrrigation)
router.patch('/:irrigationId', updateIrrigation)
router.delete('/:irrigationId', deleteIrrigation)

router.all(/.*/, (req, res) => {
	res.status(405).json({ error: 'Method Not Allowed' })
})

export default router
