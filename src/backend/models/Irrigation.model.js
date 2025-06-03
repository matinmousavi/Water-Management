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
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			// validate: {
			// 	validator: function (value) {
			// 		return value > this.startTime
			// 	},
			// 	message: 'endTime باید بعد از startTime باشد.',
			// },
		},

		durationMinutes: {
			type: Number,
			min: 1,
		},
		notes: {
			start: {
				type: String,
				trim: true,
				default: '',
			},
			end: {
				type: String,
				trim: true,
				default: '',
			},
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

// Automatically calculates duration in minutes if endTime is provided.
irrigationSchema.pre('save', function (next) {
	if (this.endTime) {
		const duration = (this.endTime - this.startTime) / (1000 * 60)
		this.durationMinutes = duration
	}
	next()
})

export default mongoose.model('Irrigation', irrigationSchema)
