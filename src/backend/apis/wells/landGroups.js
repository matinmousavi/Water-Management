import { Router } from 'express'
import Well from '../../models/Well.model.js'

const router = Router({ mergeParams: true })

router.post('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const { title, lands } = req.body

		if (!title) {
			return res.status(400).json({ message: 'عنوان گروه الزامی است.' })
		}

		const well = await Well.findById(wellId).populate('lands')
		if (!well) {
			return res.status(404).json({ message: 'چاه پیدا نشد.' })
		}

		const invalidLands = lands.filter(landId => !well.lands.some(wLand => wLand._id.equals(landId)))
		if (invalidLands.length > 0) {
			return res.status(400).json({ message: 'برخی از زمین‌ها به این چاه تعلق ندارند.' })
		}

		const group = {
			groupId: new Well.schema.path('landGroups.0.groupId').defaultValue(),
			title,
			lands,
		}

		well.landGroups.push(group)
		await well.save()

		return res.status(201).json({ message: 'گروه زمین ایجاد شد.', group })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ایجاد گروه زمین.' })
	}
})

router.get('/', async (req, res) => {
	try {
		const { wellId } = req.params
		const well = await Well.findById(wellId).populate('landGroups.lands').select('landGroups').lean()

		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		return res.status(200).json({ landGroups: well.landGroups || [] })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در دریافت گروه‌ها.' })
	}
})

router.patch('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params
		const { title, lands } = req.body

		const well = await Well.findById(wellId).populate('lands')
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const group = well.landGroups.find(g => g.groupId.equals(groupId))
		if (!group) return res.status(404).json({ message: 'گروه پیدا نشد.' })

		if (title) group.title = title

		if (lands) {
			const invalidLands = lands.filter(landId => !well.lands.some(wLand => wLand._id.equals(landId)))
			if (invalidLands.length > 0) {
				return res.status(400).json({ message: 'برخی از زمین‌ها به این چاه تعلق ندارند.' })
			}
			group.lands = lands
		}

		await well.save()
		return res.status(200).json({ message: 'گروه به‌روزرسانی شد.', group })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در ویرایش گروه.' })
	}
})

router.delete('/:groupId', async (req, res) => {
	try {
		const { wellId, groupId } = req.params
		const well = await Well.findById(wellId)
		if (!well) return res.status(404).json({ message: 'چاه پیدا نشد.' })

		const beforeCount = well.landGroups.length
		well.landGroups = well.landGroups.filter(g => !g.groupId.equals(groupId))

		if (beforeCount === well.landGroups.length) {
			return res.status(404).json({ message: 'گروه پیدا نشد.' })
		}

		await well.save()
		return res.status(200).json({ message: 'گروه حذف شد.' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'خطا در حذف گروه.' })
	}
})

export default router
