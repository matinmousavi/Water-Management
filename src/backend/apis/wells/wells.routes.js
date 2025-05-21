import { Router } from 'express'
import { createWell, deleteWell, getWell, getWells, updateWell } from './wells.controller.js'

const router = Router()

router.get('/', getWells)
router.post('/', createWell)

router.get('/:wellId', getWell)
router.patch('/:wellId', updateWell)
router.delete('/:wellId', deleteWell)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
