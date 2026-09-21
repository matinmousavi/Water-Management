import mongoose from 'mongoose'

import User from '../models/User.model.js'
import Well from '../models/Well.model.js'
import Land from '../models/Land.model.js'
import Setting from '../models/Setting.model.js'
import { syncLandsToWells } from '../utils/syncUtils.js'
import { seedDemoWorkspace } from '../utils/demoWorkspaceSeeder.js'

mongoose
    .connect(`mongodb://${process.env.DB_HOST}:27017/${process.env.DB_NAME}`)
    .then(async () => {
        console.log('✅ Connected to MongoDB...')

        await User.initializeDefaultUsers()
        await Well.initializeDefaultWells()
        await Land.initializeDefaultLands()
        await Setting.initializeSettings()
        await syncLandsToWells()
        await seedDemoWorkspace()
    })
    .catch(err => {
        console.error('❌ Could not connect to MongoDB...', err)
        throw new Error('Database connection failed')
    })

export default mongoose