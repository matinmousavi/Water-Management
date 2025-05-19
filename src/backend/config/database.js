import mongoose from 'mongoose'
import User from '../models/User.model.js'

mongoose
	.connect(`mongodb://${process.env.DB_HOST}:27017/${process.env.DB_NAME}`)
	.then(async () => {
		console.log('Connected to MongoDB...')
		await User.initializeAdmin()
	})
	.catch(err => {
		console.error('Could not connect to MongoDB...', err)
		throw new Error('Database connection failed')
	})

export default mongoose
