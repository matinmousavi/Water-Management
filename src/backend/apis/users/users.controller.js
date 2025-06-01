import User from '../../models/User.model.js'

const fieldTranslations = {
	mobile: 'شماره موبایل',
	email: 'ایمیل',
	firstName: 'نام',
	lastName: 'نام خانوادگی',
	accountingCode: 'کد حسابداری',
}

export const getUsers = async (req, res) => {
	try {
		const filter = {}

		const allowedFields = ['role', 'firstName', 'lastName', 'mobile', 'email', 'address', 'accountingCode']

		allowedFields.forEach(field => {
			if (req.query[field]) {
				filter[field] = { $regex: `^${req.query[field]}$`, $options: 'i' }
			}
		})

		const users = await User.find(filter).lean()
		return res.status(200).json({ users })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در دریافت اطلاعات کاربران!' })
	}
}

export const getUser = async (req, res) => {
	try {
		const { userId } = req.params
		const user = await User.findById(userId).populate('profilePicture')
		if (!user) {
			return res.status(404).json({ message: 'کاربر پیدا نشد.' })
		}
		return res.status(200).json({ user })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور' })
	}
}

export const createUser = async (req, res) => {
	try {
		const { role, firstName, lastName, mobile, email, accountingCode, address } = req.body

		const user = await User.create({ role, firstName, lastName, mobile, email, accountingCode, address })

		return res.status(201).json({ message: 'کاربر با موفقیت ایجاد شد.', user })
	} catch (err) {
		console.error(err.message)

		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی است.` })
		}

		return res.status(500).json({ message: 'خطا در ایجاد کاربر.' })
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
		console.error(err.message)

		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		if (err.name === 'ValidationError') {
			const firstError = Object.values(err.errors)[0]
			const field = firstError.path
			const fieldName = fieldTranslations[field] || field
			return res.status(400).json({ message: `${fieldName} الزامی است.` })
		}

		return res.status(500).json({ message: 'خطای داخلی سرور' })
	}
}

export const deleteUser = async (req, res) => {
	try {
		const { userId } = req.params

		const user = await User.findByIdAndDelete(userId)

		if (!user) {
			return res.status(404).json({ message: 'کاربر پیدا نشد.' })
		}

		return res.status(200).json({ message: 'کاربر با موفقیت حذف شد.' })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور' })
	}
}
