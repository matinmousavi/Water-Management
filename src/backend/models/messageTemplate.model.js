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
		title: {
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
			text: 'کد تأیید شما {{code}} است، {{username}} عزیز. لطفاً این کد را در اختیار دیگران قرار ندهید.',
			placeholders: [
				{ key: '{{code}}', description: 'کد تأیید ورود' },
				{ key: '{{username}}', description: 'نام و نام خانوادگی کاربر' },
			],
			type: 'sms',
		},
		{
			key: 'irrigation_start_irrigator',
			text: '{{well_irrigator}} عزیز، آبیاری زمین "{{land_title}}" متعلق به {{land_owner_name}} با استفاده از چاه "{{well_title}}" در ساعت {{start_time}} آغاز شد.',
			placeholders: [
				{ key: '{{well_title}}', description: 'عنوان چاه' },
				{ key: '{{well_irrigator}}', description: 'نام میرآب' },
				{ key: '{{land_title}}', description: 'عنوان زمین' },
				{ key: '{{land_owner_name}}', description: 'نام مالک زمین' },
				{ key: '{{start_time}}', description: 'زمان شروع آبیاری' },
				{ key: '{{end_time}}', description: 'زمان پایان آبیاری' },
				{ key: '{{duration}}', description: 'مدت زمان آبیاری (دقیقه)' },
			],
			type: 'sms',
		},
		{
			key: 'irrigation_end_irrigator',
			text: '{{well_irrigator}} عزیز، آبیاری "{{land_title}}" متعلق به {{land_owner_name}} با استفاده از چاه "{{well_title}}" در ساعت {{end_time}} به پایان رسید. مدت زمان آبیاری: {{duration}} دقیقه.',
			placeholders: [
				{ key: '{{well_title}}', description: 'عنوان چاه' },
				{ key: '{{well_irrigator}}', description: 'نام میرآب' },
				{ key: '{{land_title}}', description: 'عنوان زمین' },
				{ key: '{{land_owner_name}}', description: 'نام مالک زمین' },
				{ key: '{{start_time}}', description: 'زمان شروع آبیاری' },
				{ key: '{{end_time}}', description: 'زمان پایان آبیاری' },
				{ key: '{{duration}}', description: 'مدت زمان آبیاری (دقیقه)' },
			],
			type: 'sms',
		},
		{
			key: 'irrigation_start_landowner',
			text: 'مالک محترم {{land_owner_name}}، آبیاری زمین "{{land_title}}" با استفاده از چاه "{{well_title}}" توسط {{well_irrigator}} در ساعت {{start_time}} آغاز شد.',
			placeholders: [
				{ key: '{{well_title}}', description: 'عنوان چاه' },
				{ key: '{{well_irrigator}}', description: 'نام میرآب' },
				{ key: '{{land_title}}', description: 'عنوان زمین' },
				{ key: '{{land_owner_name}}', description: 'نام مالک زمین' },
				{ key: '{{start_time}}', description: 'زمان شروع آبیاری' },
				{ key: '{{end_time}}', description: 'زمان پایان آبیاری' },
				{ key: '{{duration}}', description: 'مدت زمان آبیاری (دقیقه)' },
			],
			type: 'sms',
		},
		{
			key: 'irrigation_end_landowner',
			text: 'مالک محترم {{land_owner_name}}، آبیاری زمین "{{land_title}}" که توسط {{well_irrigator}} با استفاده از چاه "{{well_title}}" انجام شد، در ساعت {{end_time}} پایان یافت. مدت زمان آبیاری: {{duration}} دقیقه.',
			placeholders: [
				{ key: '{{well_title}}', description: 'عنوان چاه' },
				{ key: '{{well_irrigator}}', description: 'نام میرآب' },
				{ key: '{{land_title}}', description: 'عنوان زمین' },
				{ key: '{{land_owner_name}}', description: 'نام مالک زمین' },
				{ key: '{{start_time}}', description: 'زمان شروع آبیاری' },
				{ key: '{{end_time}}', description: 'زمان پایان آبیاری' },
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
