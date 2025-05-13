import jwt from 'jsonwebtoken'
import OTP from '../../database/models/Otp.model.js'
import User from '../../database/models/User.model.js'

const isProd = import.meta.env?.PROD

const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString()
}

export const sendOtp = async (req, res) => {
	const { mobile } = req.body
	if (!mobile) return res.status(400).json({ message: 'شماره موبایل الزامی است.' })

	const existingOtp = await OTP.findOne({
		mobile,
		expiresAt: { $gt: new Date() },
		verified: false,
	})

	if (existingOtp) {
		console.log('\n\n================== 📩 OTP Sent ==================')
		console.log(`📱 Mobile: ${existingOtp.mobile}`)
		console.log(`🔐 OTP: ${existingOtp.otp}`)
		console.log('=================================================\n\n')

		return res.json({
			success: true,
			message: 'کدی که قبلا برای این شماره ارسال شده، منقضی نشده',
			cooldownUntil: existingOtp.expiresAt,
		})
	}

	const otp = generateOTP()
	const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

	await OTP.create({ mobile, otp, expiresAt })

	console.log('\n\n================== 📩 OTP Sent ==================')
	console.log(`📱 Mobile: ${mobile}`)
	console.log(`🔐 OTP: ${otp}`)
	console.log('=================================================\n\n')

	return res.json({ success: true, cooldownUntil: expiresAt, message: 'کد ارسال شد.' })
}

export const verifyOtp = async (req, res) => {
	const { mobile, otp } = req.body

	const record = await OTP.findOne({
		mobile,
		otp,
		verified: false,
		expiresAt: { $gt: new Date() },
	}).sort({ createdAt: -1 })

	if (!record) return res.status(400).json({ message: 'کد اشتباه یا منقضی شده است.' })

	const user = await User.findOne({ mobile })

	if (!user) {
		await User.create({ mobile })
	}

	record.verified = true
	await record.save()

	const token = jwt.sign({ mobile }, process.env.JWT_SECRET, { expiresIn: '7d' })

	res.cookie('token', token, {
		httpOnly: true,
		secure: isProd,
		sameSite: 'strict',
		maxAge: 7 * 24 * 60 * 60 * 1000,
	})
	return res.json({ success: true, message: 'ورود با موفقیت انجام شد.' })
}
