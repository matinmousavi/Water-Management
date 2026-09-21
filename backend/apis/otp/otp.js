import { Router } from 'express'
import jwt from 'jsonwebtoken'
import OTP from '../../models/Otp.model.js'
import User from '../../models/User.model.js'

const router = Router()
const isProd = import.meta.env?.PROD

const generateOTP = () => {
	return Math.floor(1000 + Math.random() * 9000).toString()
}

router.post('/send', async (req, res) => {
	try {
		const { mobile } = req.body

		if (!mobile) {
			return res.status(400).json({ message: 'شماره موبایل الزامی است.' })
		}

		const user = await User.findOne({ mobile })

		if (!user) {
			return res.status(400).json({ message: 'کاربری با این شماره وجود ندارد.' })
		}

		const existingOtp = await OTP.findOne({
			mobile,
			expiresAt: { $gt: new Date() },
			verified: false,
		})

		if (existingOtp) {
			return res.json({
				success: true,
				message: 'کدی که قبلا برای این شماره ارسال شده، منقضی نشده',
				cooldownUntil: existingOtp.expiresAt,
				demoOtp: existingOtp.otp,
			})
		}

		const otp = generateOTP()
		const expiresAt = new Date(Date.now() + 30 * 1000)
		await OTP.create({
			mobile,
			otp,
			expiresAt,
		})

		return res.json({
			success: true,
			cooldownUntil: expiresAt,
			message: 'کد ارسال شد.',
			demoOtp: otp,
		})
	} catch (err) {
		return res.status(500).json({
			error: err.message,
			message: 'خطا در ارسال کد OTP.',
		})
	}
})

router.post('/verify', async (req, res) => {
	try {
		const { mobile, otp } = req.body

		const record = await OTP.findOne({
			mobile,
			otp,
			verified: false,
			expiresAt: { $gt: new Date() },
		}).sort({ createdAt: -1 })

		if (!record) {
			return res.status(400).json({
				message: 'کد اشتباه یا منقضی شده است.',
			})
		}

		let user = await User.findOne({ mobile })

		if (!user) {
			user = await User.create({ mobile })
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

		return res.json({
			success: true,
			message: 'ورود با موفقیت انجام شد.',
		})
	} catch (err) {
		return res.status(500).json({
			error: err.message,
			message: 'خطا در تایید کد OTP.',
		})
	}
})

router.all(/.*/, (req, res) => {
	return res.status(405).send({
		error: 'Method Not Allowed',
	})
})

export default router
