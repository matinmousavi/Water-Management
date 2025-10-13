import mongoose from 'mongoose'

const wellSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		irrigator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		licenseCode: {
			type: String,
			trim: true,
			unique: true,
			sparse: true,
		},
		location: {
			type: String,
			trim: true,
		},
		cycleDays: {
			type: Number,
			required: true,
			min: 1,
		},
		cycleStartDate: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
		lands: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Land',
			},
		],
		landGroups: [
			{
				_id: false,
				groupId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
				title: { type: String, required: true },
				lands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Land' }],
			},
		],
	},
	{
		timestamps: true,
	}
)

wellSchema.statics.initializeDefaultWells = async function () {
	if (process.env.NODE_ENV !== 'development') {
		console.log('ℹ️ Not in development mode. Skipping default wells creation.')
		return
	}

	const wells = [
		{
			title: 'چاه شماره ۱',
			licenseCode: 'WELL-001',
			location: 'منطقه شمالی',
			cycleDays: 7,
			cycleStartDate: new Date(),
			offTime: { start: new Date(), end: new Date() },
		},
		{
			title: 'چاه شماره ۲',
			licenseCode: 'WELL-002',
			location: 'منطقه مرکزی',
			cycleDays: 10,
			cycleStartDate: new Date(),
			offTime: { start: new Date(), end: new Date() },
		},
		{
			title: 'چاه شماره ۳',
			licenseCode: 'WELL-003',
			location: 'منطقه جنوبی',
			cycleDays: 5,
			cycleStartDate: new Date(),
			offTime: { start: new Date(), end: new Date() },
		},
	]

	for (const wellData of wells) {
		const exists = await this.findOne({ licenseCode: wellData.licenseCode })
		if (!exists) {
			await this.create(wellData)
			console.log(`✅ Default well "${wellData.title}" created.`)
		} else {
			console.log(`ℹ️ Well "${wellData.title}" already exists.`)
		}
	}
}

export default mongoose.model('Well', wellSchema)
