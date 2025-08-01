import mongoose from '../config/database.js'

const scheduleSnapshotSchema = new mongoose.Schema(
	{
		well: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Well',
			required: true,
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
					type: Date,
					required: true,
				},
				endTime: {
					type: Date,
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
)

export default mongoose.model('ScheduleSnapshot', scheduleSnapshotSchema)
