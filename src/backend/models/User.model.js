import mongoose from '../config/database.js'

const userSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			enum: ['admin', 'irrigator', 'landOwner'],
			required: true,
		},
		fullName: {
			type: String,
			trim: true,
			required: true,
		},
		mobile: {
			type: String,
			trim: true,
			unique: true,
			required: true,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			unique: true,
			sparse: true,
		},
		address: {
			type: String,
			trim: true,
			default: '',
		},
		accountingCode: {
			type: String,
			trim: true,
			unique: true,
			sparse: true,
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
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

userSchema.statics.initializeDefaultUsers = async function () {
	const adminData = {
		role: 'admin',
		fullName: 'مدیر سیستم',
		mobile: '09128243530',
		email: 'admin@example.com',
		accountingCode: 'ADM-001',
		address: 'تهران، میدان آزادی',
		status: 'active',
		profilePicture: null,
	}

	const adminExists = await this.findOne({ mobile: adminData.mobile })
	if (!adminExists) {
		await this.create(adminData)
		console.log('✅ Default admin user created.')
	} else {
		console.log('ℹ️ Admin user already exists.')
	}

	const admin2Data = {
		role: 'admin',
		fullName: 'سامان عباسی',
		mobile: '09102234879',
		email: 'admin2@example.com',
		accountingCode: 'ADM-002',
		address: 'تهران، میدان آزادی',
		status: 'active',
		profilePicture: null,
	}
	const admin2Exists = await this.findOne({ mobile: admin2Data.mobile })
	if (!admin2Exists) {
		await this.create(admin2Data)
		console.log('✅ Second admin user created.')
	} else {
		console.log('ℹ️ Second admin user already exists.')
	}

	if (process.env.NODE_ENV !== 'development') {
		console.log('ℹ️ Not in development mode. Skipping other default users.')
		return
	}

	const otherRoles = [
		{
			role: 'irrigator',
			fullName: 'اپراتور آبیاری',
			mobile: '09123456788',
			email: 'irrigator@example.com',
			accountingCode: 'IRR-001',
		},
		{
			role: 'landOwner',
			fullName: 'مالک زمین',
			mobile: '09123456787',
			email: 'landowner@example.com',
			accountingCode: 'LND-001',
		},
	]

	for (const userData of otherRoles) {
		const exists = await this.findOne({ role: userData.role })
		if (!exists) {
			await this.create({
				...userData,
				address: 'تهران، میدان آزادی',
				status: 'active',
				profilePicture: null,
			})
			console.log(`✅ Default ${userData.role} user created.`)
		} else {
			console.log(`ℹ️ ${userData.role} user already exists.`)
		}
	}
}

export default mongoose.model('User', userSchema)
