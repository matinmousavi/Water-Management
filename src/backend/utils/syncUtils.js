import fs from 'fs'
import path from 'path'
import Land from '../models/Land.model.js'
import Well from '../models/Well.model.js'

const SYNC_FLAGS_PATH = path.resolve('./.sync_flags.json')

const readFlags = () => {
        if (!fs.existsSync(SYNC_FLAGS_PATH)) return {}
        try {
                return JSON.parse(fs.readFileSync(SYNC_FLAGS_PATH, 'utf8'))
        } catch (error) {
                console.error('⚠️ Could not read sync flags file:', error)
                return {}
        }
}

const writeFlags = flags => {
        try {
                fs.writeFileSync(SYNC_FLAGS_PATH, JSON.stringify(flags, null, 2))
        } catch (error) {
                console.error('⚠️ Could not write sync flags file:', error)
        }
}

/**
 * Persists a synchronization flag to disk.
 * @param {string} key - Flag identifier.
 * @param {{ executedAt: string }} [value]
 */
export const setSyncFlag = (key, value = { executedAt: new Date().toISOString() }) => {
        const flags = readFlags()
        flags[key] = value
        writeFlags(flags)
}

/**
 * Reads a synchronization flag from disk.
 * @param {string} key - Flag identifier.
 * @returns {{ executedAt: string } | null}
 */
export const getSyncFlag = key => {
        const flags = readFlags()
        return flags[key] || null
}

/**
 * Synchronizes land records to their associated wells exactly once unless forced.
 * @param {boolean} [force=false] - Forces synchronization even if a flag exists.
 * @returns {Promise<void>}
 */
export const syncLandsToWells = async (force = false) => {
        const flagKey = 'landsToWellsSync'
        const flag = getSyncFlag(flagKey)

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

        setSyncFlag(flagKey)
        console.log('🎉 Lands-to-Wells sync completed.')
}
