import Setting from '../models/Setting.model.js'
import { renderTemplate } from './renderTemplate.js'
import sendSMS from '../../services/sendSMS.js'

export async function sendTemplatedSMS({ to, key, variables = {} }) {
	const settings = await Setting.findOne().lean()

	if (!settings || !Array.isArray(settings.messageTemplates)) {
		throw new Error('هیچ قالب پیامی در تنظیمات موجود نیست.')
	}

	const template = settings.messageTemplates.find(t => t.key === key)

	if (!template) {
		throw new Error(`پیام با کلید '${key}' یافت نشد.`)
	}

	const message = renderTemplate(template.text, variables)

	console.log('📤 پیام ساخته‌شده:', message)

	// ارسال پیام:
	// return sendSMS({ to, message })
}
