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
			type: [String],
			default: [],
		},
	},
	{
		timestamps: true,
	}
)

messageTemplateSchema.statics.initializeTemplates = async function () {
	const templates = [
		{
			key: 'otp',
			text: 'کد تایید شما: {{code}}. لطفاً آن را به کسی ندهید.',
			description: 'ارسال کد تایید یکبار مصرف (OTP) به کاربر',
			placeholders: ['code'],
		},
		{
			key: 'irrigation_start',
			text: 'آبیاری زمین "{{landName}}" در ساعت {{time}} شروع شد.',
			description: 'اطلاع‌رسانی شروع آبیاری زمین',
			placeholders: ['landName', 'time'],
		},
		{
			key: 'irrigation_end',
			text: 'آبیاری زمین "{{landName}}" به پایان رسید. مدت زمان: {{duration}} دقیقه.',
			description: 'اطلاع‌رسانی پایان آبیاری زمین',
			placeholders: ['landName', 'duration'],
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
