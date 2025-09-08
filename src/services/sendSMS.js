export default async function sendSMS({ to = '', message = '' }) {
	const response = await kavenegar({ to, message })
	return response
}

async function armaghan({ to = '', message = '' }) {
	const url = 'https://negar.armaghan.net/webservice/rest/sendOneToOne?'
	const response = await fetch(
		url +
			new URLSearchParams({
				username: process.env.SMS_USERNAME,
				password: process.env.SMS_PASSWORD,
				from: process.env.SMS_NUMBER,
				to: to,
				message: message,
			}).toString()
	)
	const responseBody = await response.json()

	const errorCode = {
		0: 'عملیات با موفقیت انجام شد',
		101: 'خطای احراز هویت',
		103: 'سرشماره وارد شده اشتباه است',
		104: 'کمبود اعتبار',
		105: ' مشکلی در ساختار درخواست )request malformed)',
		107: 'شماره گیرنده پیام اشتباه است',
		110: 'آی پی شما در سیستم ثبت نشده است',
		119: 'وب سرویس برای شما فعال نشده است',
		201: 'خطای داخلی سیستم',
		160: 'مشکل در قالب انتخابی برای ارسال بر اساس الگو',
		161: 'خطا در پارامترهای ورودی ارسال بر اساس الگو',
	}
	if (responseBody.errorModel.errorCode !== 0) throw new Error(errorCode[-responseBody.errorModel.errorCode])

	return {}
}

async function kavenegar({ to = '', message = '' }) {
	const url = `https://api.kavenegar.com/v1/${process.env.SMS_API_KEY}/sms/send.json`
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			sender: process.env.SMS_SENDER,
			receptor: to,
			message: message,
		}),
	})
	const responseBody = await response.json()
	if (responseBody.return.status !== 200) throw new Error(responseBody.return.message)

	return {}
}
