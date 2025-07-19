import mongoose from '../config/database.js'

const noteSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: ['personal', 'well', 'land'],
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
			enum: ['Well', 'Land', 'User'],
		},
		text: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('Note', noteSchema)
