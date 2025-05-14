import mongoose from '../connectToDatabase.js'

const otpSchema = new mongoose.Schema({
	mobile: { type: String, required: true },
	otp: { type: String, required: true },
	verified: { type: Boolean, default: false },
	expiresAt: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now },
})

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

export default mongoose.model('Otp', otpSchema)
