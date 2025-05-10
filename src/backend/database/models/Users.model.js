import mongoose from '../connectToDatabase.js'

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			trim: true,
			sparse: true,
		},
		password: {
			type: String,
			select: false,
		},
		role: {
			type: String,
			required: true,
		},
		first_name: { type: String, trim: true },
		last_name: { type: String, trim: true },
		mobile: {
			type: String,
			trim: true,
			unique: true,
		},
		email: { type: String, trim: true, lowercase: true },
		profile_picture: {
			type: {
				name: String,
				md5: String,
				mimetype: String,
				size: Number,
				url: String,
			},
		},
	},
	{ timestamps: true }
)

export default mongoose.model('User', userSchema)
