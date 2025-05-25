import Well from '../../models/Well.model.js'

const fieldTranslations = {
	licenseCode: 'کد پروانه',
	title: 'عنوان',
	cycleDays: 'تعداد روزهای چرخه',
	irrigator: 'آبیار',
}

export const getWells = async (req, res) => {
	try {
		const wells = await Well.find().populate('irrigator').populate('lands').lean()
		return res.status(200).json({ wells })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({
			message: 'خطا در دریافت اطلاعات چاه‌ها!',
		})
	}
}

export const getWell = async (req, res) => {
	try {
		const { wellId } = req.params
		const well = await Well.findById(wellId).populate('irrigator').populate('lands')

		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}
		return res.status(200).json({ well })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({
			message: 'خطای داخلی سرور.',
		})
	}
}

export const createWell = async (req, res) => {
	try {
		const { title, licenseCode, cycleDays, irrigator, lands } = req.body
		const newWell = await Well.create({ title, licenseCode, cycleDays, irrigator, lands })

		return res.status(201).json({
			message: 'چاه با موفقیت ایجاد شد.',
			well: newWell,
		})
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

		return res.status(500).json({
			message: 'خطا در ایجاد چاه.',
		})
	}
}

export const updateWell = async (req, res) => {
	try {
		const { wellId } = req.params
		const updates = req.body

		const well = await Well.findById(wellId)
		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		Object.assign(well, updates)
		await well.save()

		const updated = await Well.findById(wellId).populate('irrigator').populate('lands')

		return res.status(200).json({
			message: 'چاه با موفقیت ویرایش شد.',
			well: updated,
		})
	} catch (err) {
		console.error(err.message)

		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		return res.status(500).json({
			message: 'خطا در ویرایش چاه.',
		})
	}
}

export const deleteWell = async (req, res) => {
	try {
		const { wellId } = req.params
		const well = await Well.findByIdAndDelete(wellId)

		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		return res.status(200).json({ message: 'چاه با موفقیت حذف شد.' })
	} catch (err) {
		console.error('خطا در حذف چاه:', err.message)
		return res.status(500).json({
			message: 'خطای داخلی سرور.',
		})
	}
}
