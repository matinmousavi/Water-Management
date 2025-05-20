import mongoose from '../config/database.js'

const fileSchema = new mongoose.Schema(
	{
		name: String,
		md5: String,
		mimetype: String,
		size: Number,
		url: String,
	},
	{ timestamps: true }
)

export default mongoose.model('File', fileSchema)
