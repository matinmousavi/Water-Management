import MessageTemplates from '../backend/models/messageTemplate.model.js'
import { renderTemplate } from '../utils/renderTemplate.js'
import sendSMS from '../services/sendSMS.js'

export async function sendTemplatedSMS({ to, key, variables = {} }) {
	const template = await MessageTemplates.findOne({ key })

	if (!template) {
		throw new Error(`پیام با کلید '${key}' یافت نشد.`)
	}

	const message = renderTemplate(template.text, variables)

	console.log(message)

	// return sendSMS({ to, message })
}
