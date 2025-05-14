import User from '../../database/models/User.model.js'

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

		const existingUser = await User.findOne({
			$or: [{ mobile }, { email }],
		})

		if (existingUser) {
			return res.status(409).json({
				message: 'کاربری با این ایمیل یا شماره موبایل قبلاً ثبت شده است.',
			})
		}

		await User.create({
			roles,
			firstName,
			lastName,
			mobile,
			email,
		})

		return res.status(201).json({
			message: 'کاربر با موفقیت ایجاد شد.',
		})
	} catch (err) {
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

		if (updates.email && updates.email !== user.email) {
			const existing = await User.findOne({ email: updates.email })
			if (existing) {
				return res.status(400).json({ message: 'ایمیل قبلاً ثبت شده است.' })
			}
		}

		if (updates.mobile && updates.mobile !== user.mobile) {
			const existing = await User.findOne({ mobile: updates.mobile })
			if (existing) {
				return res.status(400).json({ message: 'شماره موبایل قبلاً ثبت شده است.' })
			}
		}

		Object.assign(user, updates)
		await user.save()

		return res.status(200).json({ message: 'کاربر با موفقیت ویرایش شد.', user })
	} catch (err) {
		console.error('خطا در ویرایش کاربر:', err)
		return res.status(500).json({ message: 'خطای داخلی سرور', error: err.message })
	}
}
