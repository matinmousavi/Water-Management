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
		},
		profilePicture: {
			type: {
				name: String,
				md5: String,
				mimetype: String,
				size: Number,
				url: String,
			},
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
		console.log('✅ ادمین پیش‌فرض از داخل مدل ایجاد شد.')
	} else {
		console.log('ℹ️ ادمین موجود بود. نیازی به ایجاد نیست.')
	}
}

export default mongoose.model('User', userSchema)
