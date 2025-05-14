import { Router } from 'express'
import { createUser, getUsers } from './users.controller,js'

const router = Router()

router.get('/', getUsers)
router.post('/', createUser)
router.patch('/:userId', createUser)

router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
