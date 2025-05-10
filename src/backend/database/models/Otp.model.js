import mongoose from '../connectToDatabase.js'

const otpSchema = new mongoose.Schema(
	{
		mobile: {
			type: String,
			required: true,
			trim: true,
		},
		otp: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		isUsed: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('Otp', otpSchema)
