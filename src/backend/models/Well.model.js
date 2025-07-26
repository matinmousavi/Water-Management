import mongoose from '../config/database.js'

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
		workTime: {
			start: {
				type: Date,
				required: true,
			},
			end: {
				type: Date,
				required: true,
			},
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
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('Well', wellSchema)
