import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
	{
		workspaceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'DemoWorkspace',
			required: true,
			index: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: ['personal', 'well', 'land', 'landGroup'],
			required: true,
		},
		reference: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			refPath: 'typeRef',
		},
		typeRef: {
			type: String,
			required: true,
			enum: ['Well', 'Land', 'User', 'LandGroup'],
		},
		text: {
			type: String,
			required: true,
			trim: true,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
)

export default mongoose.model('Note', noteSchema)
