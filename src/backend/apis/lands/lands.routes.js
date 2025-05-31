import { Router } from 'express'
import { addNoteToLand, createLand, deleteLand, deleteNoteFromLand, getLand, getLands, updateLand, updateNoteOnLand } from './lands.controller.js'

const router = Router()

router.get('/', getLands)
router.post('/', createLand)

router.get('/:landId', getLand)
router.patch('/:landId', updateLand)
router.delete('/:landId', deleteLand)

router.post('/:landId/notes', addNoteToLand)
router.put('/:landId/notes/:noteId', updateNoteOnLand)
router.delete('/:landId/notes/:noteId', deleteNoteFromLand)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
