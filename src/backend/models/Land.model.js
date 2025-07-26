import mongoose from '../config/database.js'

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
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('Land', landSchema)
