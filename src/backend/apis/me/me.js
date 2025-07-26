import { Router } from 'express'

const router = Router()

const isProd = import.meta.env?.PROD

// GET current user profile
router.get('/', async (req, res) => {
	const user = req.user

	if (!user) {
		return res.status(401).json({ message: 'لطفاً وارد حساب کاربری خود شوید.' })
	}

	return res.json({ user })
})

// PATCH update current user profile
router.patch('/', async (req, res) => {
	try {
		const user = req.user
		const updates = req.body

		if (!user) {
			return res.status(401).json({ message: 'لطفاً وارد حساب کاربری خود شوید.' })
		}

		Object.assign(user, updates)
		await user.save()
		return res.json({ message: 'اطلاعات با موفقیت به‌روزرسانی شد.', user })
	} catch (err) {
		return res.status(500).json({ error: err.message, message: 'خطا در به‌روزرسانی اطلاعات.' })
	}
})

// GET logout current user
router.get('/logout', (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		secure: isProd,
		sameSite: 'strict',
	})

	return res.json({ message: 'خروج با موفقیت انجام شد.' })
})

// Fallback for unsupported methods
router.all(/.*/, (req, res) => {
	return res.status(405).send({ error: 'Method Not Allowed' })
})

export default router
