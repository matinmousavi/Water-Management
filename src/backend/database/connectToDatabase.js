import mongoose from 'mongoose'

mongoose
	.connect(`mongodb://${process.env.DB_HOST}:27017/${process.env.DB_NAME}`)
	.then(() => console.log('Connected to MongoDB...'))
	.catch(err => {
		console.error('Could not connect to MongoDB...', err)
		throw new Error('Database connection failed')
	})

export default mongoose
