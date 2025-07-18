// models/Setting.model.js
import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema(
	{
		irrigationLogSettings: {
			descriptionEdit: {
				type: Number,
				default: 24,
			},
			timeMargin: {
				type: Number,
				default: 30,
			},
		},
	},
	{ timestamps: true }
)

settingSchema.statics.initializeSettings = async function () {
	const exists = await this.findOne()
	if (!exists) {
		const defaultSetting = {
			irrigationLogSettings: {
				descriptionEdit: 24,
				timeMargin: 30,
			},
		}
		await this.create(defaultSetting)
		console.log('Default setting created.')
	} else {
		console.log('Setting already exists.')
	}
}

export default mongoose.model('Setting', settingSchema)
