import Land from '../../models/Land.model.js'
import Well from '../../models/Well.model.js'

const fieldTranslations = {
	name: 'نام زمین',
	owner: 'مالک',
	area: 'مساحت',
	kFactor: 'ضریب K',
	location: 'موقعیت',
	irrigationType: 'نوع آبیاری',
}

async function attachWells(land) {
	const wells = await Well.find({ lands: land._id }).populate('irrigator').populate('lands').lean()
	return { ...land, wells }
}

export const getLands = async (req, res) => {
	try {
		const lands = await Land.find().populate('owner').lean()

		const landsWithWells = await Promise.all(lands.map(async land => await attachWells(land)))

		return res.status(200).json({ lands: landsWithWells })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطا در دریافت اطلاعات زمین‌ها!' })
	}
}

export const getLand = async (req, res) => {
	try {
		const { landId } = req.params

		const land = await Land.findById(landId).populate('owner').lean()

		if (!land) {
			return res.status(404).json({ message: 'زمین پیدا نشد.' })
		}
		const landWithWells = await attachWells(land)
		return res.status(200).json({ land: landWithWells })
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
}

export const createLand = async (req, res) => {
	try {
		const { name, owner, area, kFactor, location, irrigationType } = req.body

		const newLand = await Land.create({ name, owner, area, kFactor, location, irrigationType })

		return res.status(201).json({ message: 'زمین با موفقیت ایجاد شد.', land: newLand })
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

		return res.status(500).json({ message: 'خطا در ایجاد زمین.' })
	}
}

export const updateLand = async (req, res) => {
	try {
		const { landId } = req.params
		const updates = req.body

		const land = await Land.findById(landId)

		if (!land) {
			return res.status(404).json({ message: 'زمین پیدا نشد.' })
		}

		Object.assign(land, updates)

		await land.save()

		const updated = await Land.findById(landId).populate('owner').lean()
		const updatedWithWells = await attachWells(updated)

		return res.status(200).json({ message: 'زمین با موفقیت ویرایش شد.', updated: updatedWithWells })
	} catch (err) {
		console.error(err.message)

		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0]
			const fieldName = fieldTranslations[field] || field
			return res.status(409).json({ message: `این ${fieldName} قبلاً ثبت شده است.` })
		}

		return res.status(500).json({ message: 'خطا در ویرایش زمین.' })
	}
}

export const deleteLand = async (req, res) => {
	try {
		const { landId } = req.params

		const land = await Land.findByIdAndDelete(landId)

		if (!land) {
			return res.status(404).json({ message: 'زمین پیدا نشد.' })
		}

		return res.status(200).json({ message: 'زمین با موفقیت حذف شد.' })
	} catch (err) {
		console.error('خطا در حذف زمین:', err.message)
		return res.status(500).json({ message: 'خطای داخلی سرور.' })
	}
}
