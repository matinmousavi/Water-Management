import mongoose from '../config/database.js'

const landSchema = new mongoose.Schema(
	{
		name: {
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
		location: {
			type: String,
			default: '',
		},
		irrigationType: {
			type: String,
			enum: ['قطره‌ای', 'بارانی', 'سطحی', 'چاه دستی', 'سایر'],
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('Land', landSchema)
