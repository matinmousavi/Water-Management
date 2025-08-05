import mongoose from '../config/database.js'

const scheduleSnapshotSchema = new mongoose.Schema(
	{
		well: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Well',
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
		},
		schedules: [
			{
				targetType: {
					type: String,
					enum: ['land', 'group'],
					required: true,
				},
				title: {
					type: String,
					required: true,
				},
				land: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Land',
				},
				landGroup: {
					type: mongoose.Schema.Types.ObjectId,
				},
				startTime: {
					type: String,
					required: true,
				},
				endTime: {
					type: String,
					required: true,
				},
				color: { type: String },
			},
		],
	},
	{ timestamps: true }
)

export default mongoose.model('ScheduleSnapshot', scheduleSnapshotSchema)
