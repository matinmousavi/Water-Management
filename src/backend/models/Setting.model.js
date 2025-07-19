import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema(
	{
		irrigations: {
			descriptionEditHours: {
				time: { type: Number, required: true, default: 24 },
			},
			logTimeMarginMinutes: {
				time: { type: Number, required: true, default: 30 },
			},
		},

		messageTemplates: {
			type: [
				{
					key: { type: String, required: true, trim: true },
					text: { type: String, required: true, trim: true },
					type: { type: String, default: 'sms' },
					placeholders: {
						type: [
							{
								key: { type: String, required: true },
								description: { type: String, default: '' },
							},
						],
						default: [],
					},
				},
			],
			default: [],
		},
	},
	{ timestamps: true }
)

settingSchema.statics.initializeSettings = async function () {
	const exists = await this.findOne()
	if (!exists) {
		const defaultSetting = {
			irrigations: {
				descriptionEditHours: {
					time: { type: Number, required: true, default: 24 },
				},
				logTimeMarginMinutes: {
					time: { type: Number, required: true, default: 30 },
				},
			},
			messageTemplates: [
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
			],
		}

		await this.create(defaultSetting)
	}
}

export default mongoose.model('Setting', settingSchema)
