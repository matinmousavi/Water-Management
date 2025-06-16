import mongoose from 'mongoose'

const messageTemplateSchema = new mongoose.Schema(
	{
		key: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		text: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			default: '',
			trim: true,
		},
		placeholders: {
			type: [
				{
					key: { type: String, required: true },
					description: { type: String, default: '' },
				},
			],
			default: [],
		},
		type: {
			type: String,
			default: 'sms',
		},
	},
	{ timestamps: true }
)

messageTemplateSchema.statics.initializeTemplates = async function () {
	const templates = [
		{
			key: 'otp',
			text: 'کد تایید شما: {{code}}. لطفاً آن را به کسی ندهید.',
			description: 'ارسال کد تایید یکبار مصرف (OTP) به کاربر',
			placeholders: [{ key: '{{code}}', description: 'کد تأیید ورود' }],
			type: 'sms',
		},
		{
			key: 'irrigation_start',
			text: 'آبیاری زمین "{{landTitle}}" در ساعت {{time}} شروع شد.',
			description: 'اطلاع‌رسانی شروع آبیاری زمین',
			placeholders: [
				{ key: '{{landTitle}}', description: 'نام زمین' },
				{ key: '{{time}}', description: 'زمان شروع' },
			],
			type: 'sms',
		},
		{
			key: 'irrigation_end',
			text: 'آبیاری زمین "{{landTitle}}" به پایان رسید. مدت زمان: {{duration}} دقیقه.',
			description: 'اطلاع‌رسانی پایان آبیاری زمین',
			placeholders: [
				{ key: '{{landTitle}}', description: 'نام زمین' },
				{ key: '{{duration}}', description: 'مدت زمان آبیاری (دقیقه)' },
			],
			type: 'sms',
		},
	]

	for (const template of templates) {
		const exists = await this.findOne({ key: template.key })
		if (!exists) {
			await this.create(template)
			console.log(`Template '${template.key}' added.`)
		} else {
			console.log(`Template '${template.key}' already exists.`)
		}
	}
}

export default mongoose.model('MessageTemplate', messageTemplateSchema)
