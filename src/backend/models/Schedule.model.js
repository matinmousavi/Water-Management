import mongoose from '../config/database.js'

const scheduleSchema = new mongoose.Schema(
	{
		well: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Well',
			required: true,
		},
		land: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Land',
		},
		landGroup: {
			type: mongoose.Schema.Types.ObjectId,
		},
		targetType: {
			type: String,
			enum: ['land', 'group'],
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			required: true,
		},
		day: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
	},
	{ timestamps: true }
)

export default mongoose.model('Schedule', scheduleSchema)
