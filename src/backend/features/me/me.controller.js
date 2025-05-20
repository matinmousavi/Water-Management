const isProd = import.meta.env?.PROD

export async function getMe(req, res) {
	const user = req.user

	if (!user) {
		return res.status(401).json({ message: 'لطفاً وارد حساب کاربری خود شوید.' })
	}

	return res.json({ user })
}

export async function updateMe(req, res) {
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
}

export const logout = (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		secure: isProd,
		sameSite: 'strict',
	})

	return res.json({ message: 'خروج با موفقیت انجام شد.' })
}
