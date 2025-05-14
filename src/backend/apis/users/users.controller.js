import User from '../../database/models/User.model.js'

const fieldTranslations = {
	mobile: 'شماره موبایل',
	email: 'ایمیل',
}

export const getUsers = async (req, res) => {
	try {
		const users = await User.find().lean()
		return res.status(200).json({ users })
	} catch (err) {
		return res.status(500).json({ error: err.message, message: 'خطا در دریافت اطلاعات کاربران!' })
	}
}

export const createUser = async (req, res) => {
	try {
		const { roles, firstName, lastName, mobile, email } = req.body

		await User.create({ roles, firstName, lastName, mobile, email })

		return res.status(201).json({
			message: 'کاربر با موفقیت ایجاد شد.',
		})
	} catch (err) {
		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations[field] || field

			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}
		return res.status(500).json({
			message: 'خطا در ایجاد کاربر.',
			error: err.message,
		})
	}
}

export const updateUser = async (req, res) => {
	try {
		const { userId } = req.params
		const updates = req.body

		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).json({ message: 'کاربر پیدا نشد.' })
		}

		Object.assign(user, updates)

		await user.save()

		return res.status(200).json({ message: 'کاربر با موفقیت ویرایش شد.', user })
	} catch (err) {
		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations[field] || field

			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		console.error('خطا در ویرایش کاربر:', err)
		return res.status(500).json({ error: err.message, message: 'خطای داخلی سرور' })
	}
}
