import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import fileUpload from 'express-fileupload'
import compression from 'compression'
import morgan from 'morgan'
import api from './backend/apis/index.js'
import cookieParser from 'cookie-parser'

const isProd = import.meta.env?.PROD
const PORT = process.env.PORT || 5173

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, isProd ? './public' : '../public')
const uploadsDir = path.resolve(__dirname, isProd ? './uploads' : '../uploads')
const assetsDir = path.resolve(__dirname, './assets')

async function createServer() {
	const app = express()

	// Basic logging
	app.use(morgan(isProd ? 'common' : 'dev'))

	app.use(cookieParser())

	app.use(express.json())

	// File uploads
	app.use(
		fileUpload({
			createParentPath: true,
			limits: { fileSize: 5 * 1024 * 1024 },
			useTempFiles: true,
			tempFileDir: '/tmp/',
		})
	)

	// Using compression middleware to compress responses
	app.use(compression())

	// API routes with optional delay in development
	if (process.env.NO_API !== 'true') {
		const apiRouter = express.Router()
		if (!isProd) {
			apiRouter.use((req, res, next) => setTimeout(next, 1000))
		}
		apiRouter.use(api)
		apiRouter.use((req, res) => res.status(404).json({ error: 'API not found' }))
		app.use('/api', apiRouter)
	}

	// Global error handler
	app.use((err, req, res, next) => {
		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	})

	// Vite integration in development - apply before static to allow module resolution
	if (!isProd) {
		const { createServer: createViteServer } = await import('vite')
		const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' })
		app.use(vite.middlewares)
		app.vite = vite
	}

	// Static assets
	app.use(express.static(publicDir))
	app.use('/uploads', express.static(uploadsDir))
	app.use('/assets', express.static(assetsDir))

	// SPA fallback
	app.get(/.*/, (req, res, next) => {
		const indexFile = path.resolve(__dirname, 'index.html')
		fs.readFile(indexFile, 'utf-8', (err, html) => {
			if (err) return next(err)
			if (!isProd && app.vite) {
				app.vite
					.transformIndexHtml(req.originalUrl, html)
					.then(transformed => res.type('html').send(transformed))
					.catch(next)
			} else {
				res.type('html').send(html)
			}
		})
	})

	app.listen(PORT, '0.0.0.0', err => {
		if (err) {
			console.error(`🚨 Failed to start server on port ${PORT}:`, err.message)
			process.exit(1)
		} else {
			console.log('\n\n================== ✅ Server Started ==================')
			console.log(`🚀 Running at: http://localhost:${PORT}`)
			console.log('=======================================================\n\n')
		}
	})
}

createServer()
