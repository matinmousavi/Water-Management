import mongoose from '../connectToDatabase.js'

const userSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			enum: ['admin', 'irrigator', 'landOwner'],
		},
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		mobile: {
			type: String,
			trim: true,
			unique: true,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			unique: true,
			sparse: true,
		},
		profilePicture: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'File',
			default: null,
		},
	},
	{
		timestamps: true,
	}
)

userSchema.statics.initializeAdmin = async function () {
	const count = await this.countDocuments()
	if (count === 0) {
		await this.create({
			role: 'admin',
			firstName: 'مدیر',
			lastName: 'سیستم',
			mobile: '09123456789',
			email: 'admin@example.com',
		})
		console.log('✅ Default admin user created from the model.')
	} else {
		console.log('ℹ️ Admin user already exists. No need to create one.')
	}
}

export default mongoose.model('User', userSchema)
