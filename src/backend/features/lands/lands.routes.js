import { Router } from 'express'
import { createLand, deleteLand, getLand, getLands, updateLand } from './lands.controller.js'

const router = Router()

router.get('/', getLands)
router.post('/', createLand)

router.get('/:landId', getLand)
router.patch('/:landId', updateLand)
router.delete('/:landId', deleteLand)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
