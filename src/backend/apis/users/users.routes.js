import { Router } from 'express'
import { createUser, deleteUser, getUser, getUsers, updateUser } from './users.controller.js'

const router = Router()

router.get('/', getUsers)
router.post('/', createUser)

router.get('/:userId', getUser)
router.patch('/:userId', updateUser)
router.delete('/:userId', deleteUser)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
