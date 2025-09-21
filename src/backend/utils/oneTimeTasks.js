// utils/oneTimeTasks.js
import fs from 'fs'
import path from 'path'
import Land from '../models/Land.model.js'
import Well from '../models/Well.model.js'

const SYNC_FLAGS_PATH = path.resolve('./.sync_flags.json')

function readFlags() {
	if (!fs.existsSync(SYNC_FLAGS_PATH)) return {}
	try {
		return JSON.parse(fs.readFileSync(SYNC_FLAGS_PATH, 'utf8'))
	} catch (err) {
		console.error('⚠️ Could not read sync flags file:', err)
		return {}
	}
}

function writeFlags(flags) {
	try {
		fs.writeFileSync(SYNC_FLAGS_PATH, JSON.stringify(flags, null, 2))
	} catch (err) {
		console.error('⚠️ Could not write sync flags file:', err)
	}
}

export function setFlag(key, value = { executedAt: new Date().toISOString() }) {
	const flags = readFlags()
	flags[key] = value
	writeFlags(flags)
}

export function getFlag(key) {
	const flags = readFlags()
	return flags[key] || null
}

export async function syncLandsToWells(force = false) {
	const flagKey = 'landsToWellsSync'
	const flag = getFlag(flagKey)

	if (flag && !force) {
		console.log('ℹ️ Lands-to-Wells sync already executed. Skipping...')
		return
	}

	console.log('🔄 Syncing lands to wells...')

	const lands = await Land.find()
	for (const land of lands) {
		if (!land.location) continue

		const well = await Well.findOne({ licenseCode: land.location })
		if (!well) continue

		const alreadyInWell = well.lands.some(landId => landId.toString() === land._id.toString())

		if (!alreadyInWell) {
			well.lands.push(land._id)
			await well.save()
			console.log(`✅ Land "${land.title}" added to Well "${well.title}"`)
		}
	}

	setFlag(flagKey)
	console.log('🎉 Lands-to-Wells sync completed.')
}
