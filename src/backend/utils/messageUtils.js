import Setting from '../models/Setting.model.js'

/**
 * Renders a text template by replacing placeholders with variable values.
 * @param {string} template - Template text containing {{variable}} placeholders.
 * @param {Record<string, string | number>} [variables={}] - Replacement values.
 * @returns {string} Rendered template text.
 */
export const renderTemplate = (template, variables = {}) =>
	template.replace(/{{(.*?)}}/g, (_, key) => {
		const value = variables[key.trim()]
		return value !== undefined ? value : ''
	})

/**
 * Sends an SMS message using a stored template and contextual variables.
 * @param {{ to: string, key: string, variables?: Record<string, string | number> }} params - SMS configuration.
 * @returns {Promise<void>}
 */
export const sendTemplatedSMS = async ({ to, key, variables = {} }) => {
	const settings = await Setting.findOne().lean()

	if (!settings || !Array.isArray(settings.messageTemplates)) {
		throw new Error('هیچ قالب پیامی در تنظیمات موجود نیست.')
	}

	const template = settings.messageTemplates.find(messageTemplate => messageTemplate.key === key)

	if (!template) {
		throw new Error(`پیام با کلید '${key}' یافت نشد.`)
	}

	const message = renderTemplate(template.text, variables)

	console.log('📨 گیرنده پیام:', to)
	console.log('📤 پیام ساخته‌شده:', message)

	// ارسال پیام:
	// return sendSMS({ to, message })
}
