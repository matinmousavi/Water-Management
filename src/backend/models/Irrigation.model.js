import mongoose from '../config/database.js'

const irrigationSchema = new mongoose.Schema(
	{
		land: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Land',
			required: true,
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
		startedAt: {
			type: Date,
			required: true,
		},
		endedAt: {
			type: Date,
		},
		duration: {
			type: String,
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

// Automatically calculates duration in HH:mm format if endedAtAt is provided.
irrigationSchema.pre('save', function (next) {
	if (this.endedAt && this.startedAt) {
		const diffMs = this.endedAt - this.startedAt
		const totalSeconds = Math.floor(diffMs / 1000)

		const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
		const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')

		this.duration = `${hours}:${minutes}`
	}
	next()
})

export default mongoose.model('Irrigation', irrigationSchema)
