import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
	{
		recipientGroup: {
			type: String,
			enum: ['all', 'admin', 'irrigator', 'landOwner'],
			required: true,
		},
		recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

		message: {
			type: String,
			required: true,
			trim: true,
		},
		medium: {
			type: String,
			enum: ['sms', 'email', 'push'],
			default: 'sms',
		},
		sentBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		sentAt: {
			type: Date,
			default: Date.now,
		},
		meta: {
			successCount: { type: Number, default: 0 },
			failCount: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
)

export default mongoose.model('Notification', notificationSchema)
