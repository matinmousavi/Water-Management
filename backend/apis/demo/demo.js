import { Router } from 'express'
import crypto from 'crypto'
import DemoSession from '../../models/DemoSession.model.js'
import DemoWorkspace from '../../models/DemoWorkspace.model.js'
import { seedDemoWorkspace } from '../../utils/demoWorkspaceSeeder.js'
import User from '../../models/User.model.js'

const router = Router()

const SESSION_COOKIE = 'demo_session'

const createDemoWorkspace = async sessionId => {
	const workspace = await DemoWorkspace.create({
		name: `Demo Workspace - ${sessionId.slice(0, 8)}`,
		type: 'demo',
		status: 'active',
	})

	await DemoSession.create({
		sessionId,
		workspaceId: workspace._id,
	})

	await seedDemoWorkspace(workspace._id)

	return workspace
}

const getDemoUsers = async workspaceId => {
	return User.find({
		workspaceId,
		accountingCode: {
			$regex: /^DEMO-(ADMIN|IRRIGATOR|LANDOWNER)-/i,
		},
		role: {
			$in: ['admin', 'irrigator', 'landOwner'],
		},
	})
		.select('role fullName mobile')
		.sort({ role: 1 })
		.lean()
}

router.get('/session', async (req, res) => {
	try {
		let sessionId = req.cookies?.[SESSION_COOKIE]

		if (!sessionId) {
			sessionId = crypto.randomUUID()

			const workspace = await createDemoWorkspace(sessionId)
			const users = await getDemoUsers(workspace._id)

			res.cookie(SESSION_COOKIE, sessionId, {
				httpOnly: true,
				secure: import.meta.env?.PROD,
				sameSite: 'strict',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			})

			return res.json({
				success: true,
				sessionId,
				workspaceId: workspace._id,
				users,
			})
		}

		let session = await DemoSession.findOne({
			sessionId,
		})

		if (!session) {
			const workspace = await createDemoWorkspace(sessionId)
			const users = await getDemoUsers(workspace._id)

			res.cookie(SESSION_COOKIE, sessionId, {
				httpOnly: true,
				secure: import.meta.env?.PROD,
				sameSite: 'strict',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			})

			return res.json({
				success: true,
				sessionId,
				workspaceId: workspace._id,
				users,
			})
		}

		let workspace = await DemoWorkspace.findOne({
			_id: session.workspaceId,
			type: 'demo',
			status: 'active',
		})

		if (!workspace) {
			await DemoSession.deleteOne({
				_id: session._id,
			})

			const newSessionId = crypto.randomUUID()
			workspace = await createDemoWorkspace(newSessionId)
			const users = await getDemoUsers(workspace._id)

			res.cookie(SESSION_COOKIE, newSessionId, {
				httpOnly: true,
				secure: import.meta.env?.PROD,
				sameSite: 'strict',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			})

			return res.json({
				success: true,
				sessionId: newSessionId,
				workspaceId: workspace._id,
				users,
			})
		}

		await seedDemoWorkspace(workspace._id)

		session.lastActivityAt = new Date()
		await session.save()

		workspace.lastActivityAt = new Date()
		await workspace.save()

		const users = await getDemoUsers(workspace._id)

		return res.json({
			success: true,
			sessionId,
			workspaceId: workspace._id,
			users,
		})
	} catch (err) {
		return res.status(500).json({
			message: 'خطا در ایجاد محیط دمو.',
			error: err.message,
		})
	}
})

router.all(/.*/, (req, res) => {
	return res.status(405).json({
		error: 'Method Not Allowed',
	})
})

export default router
