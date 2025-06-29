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
		location: {
			type: String,
			default: '',
		},
		irrigationType: {
			type: String,
			enum: ['قطره‌ای', 'بارانی', 'سطحی', 'چاه دستی', 'سایر'],
			required: true,
		},
		cropType: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
		notes: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				text: {
					type: String,
					required: true,
					trim: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('Land', landSchema)
