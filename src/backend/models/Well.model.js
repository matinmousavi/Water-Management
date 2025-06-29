import mongoose from '../config/database.js'

const wellSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		licenseCode: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		cycleDays: {
			type: Number,
			required: true,
			min: 1,
		},
		location: {
			type: String,
			trim: true,
			default: '',
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
		irrigator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
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
