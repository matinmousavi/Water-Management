import mongoose from 'mongoose'
import User from './User.model.js'

const landSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		area: {
			type: Number,
			required: true,
		},
		kFactor: {
			type: Number,
			required: true,
		},
		cropType: {
			type: String,
			trim: true,
		},
		irrigationType: {
			type: String,
			enum: ['قطره‌ای', 'بارانی', 'سطحی', 'چاه دستی', 'سایر'],
		},
		location: {
			type: String,
			default: '',
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
		notificationsEnabled: {
			type: Boolean,
			default: true,
		},
		groupMemberships: [
			{
				wellId: { type: mongoose.Schema.Types.ObjectId, ref: 'Well', required: true },
				groupId: { type: mongoose.Schema.Types.ObjectId, required: true },
				groupTitle: { type: String, required: true },
				startDate: { type: Date, required: true, default: Date.now },
				endDate: { type: Date, default: null },
			},
		],
	},
	{
		timestamps: true,
	}
)

landSchema.statics.initializeDefaultLands = async function () {
	if (process.env.NODE_ENV !== 'development') {
		console.log('ℹ️ Not in development mode. Skipping default lands creation.')
		return
	}

	const owner = await User.findOne({ role: 'landOwner' })
	if (!owner) {
		console.log('⚠️ No landOwner user found. Skipping lands creation.')
		return
	}

	const lands = [
		{
			title: 'زمین شمالی',
			area: 1000,
			kFactor: 0.8,
			cropType: 'گندم',
			irrigationType: 'قطره‌ای',
			location: 'منطقه ۱',
			notificationsEnabled: true,
		},
		{
			title: 'زمین مرکزی',
			area: 1500,
			kFactor: 0.9,
			cropType: 'جو',
			irrigationType: 'بارانی',
			location: 'منطقه ۲',
			notificationsEnabled: true,
		},
		{
			title: 'زمین جنوبی',
			area: 1200,
			kFactor: 0.85,
			cropType: 'ذرت',
			irrigationType: 'سطحی',
			location: 'منطقه ۳',
			notificationsEnabled: true,
		},
	]

	for (const landData of lands) {
		const exists = await this.findOne({ title: landData.title })
		if (!exists) {
			await this.create({
				...landData,
				owner: owner._id,
				status: 'active',
				groupMemberships: [],
			})
			console.log(`✅ Default land "${landData.title}" created.`)
		} else {
			console.log(`ℹ️ Land "${landData.title}" already exists.`)
		}
	}
}

export default mongoose.model('Land', landSchema)
