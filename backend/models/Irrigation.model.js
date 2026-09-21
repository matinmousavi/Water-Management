import mongoose from '../config/database.js'

const irrigationSchema = new mongoose.Schema(
	{
		workspaceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'DemoWorkspace',
			required: true,
			index: true,
		},
		land: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Land',
			default: null,
		},
		well: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Well',
			required: true,
		},
		landGroup: {
			type: mongoose.Schema.Types.ObjectId,
			default: null,
		},
		isGroupLog: {
			type: Boolean,
			default: false,
		},
		wasGroupLog: {
			type: Boolean,
			default: false,
		},
		startedAt: {
			type: Date,
			required: true,
		},
		endedAt: {
			type: Date,
		},
		duration: {
			type: String,
			default: null,
		},
		note: {
			type: String,
			trim: true,
			default: '',
		},
		isOngoing: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true }
)

function msToHm(ms) {
	if (!ms || ms <= 0) return '00:00'
	const totalMinutes = Math.floor(ms / 60000)
	const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
	const minutes = String(totalMinutes % 60).padStart(2, '0')
	return `${hours}:${minutes}`
}

irrigationSchema.pre('save', function (next) {
	if (this.startedAt && this.endedAt) {
		const diffMs = new Date(this.endedAt) - new Date(this.startedAt)
		this.duration = msToHm(diffMs)
	}
	next()
})

export default mongoose.model('Irrigation', irrigationSchema)
