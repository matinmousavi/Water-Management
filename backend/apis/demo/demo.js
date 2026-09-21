import { Router } from 'express'
import crypto from 'crypto'

import DemoSession from '../../models/DemoSession.model.js'
import DemoWorkspace from '../../models/DemoWorkspace.model.js'

const router = Router()

const SESSION_COOKIE = 'demo_session'

router.get('/session', async (req, res) => {
    try {
        let sessionId = req.cookies?.[SESSION_COOKIE]

        if (!sessionId) {
            sessionId = crypto.randomUUID()

            const workspace = await DemoWorkspace.create({
                name: `Demo Workspace - ${sessionId.slice(0, 8)}`,
                type: 'demo',
                status: 'active',
            })

            await DemoSession.create({
                sessionId,
                workspaceId: workspace._id,
            })

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
            })
        }

        const session = await DemoSession.findOne({
            sessionId,
        })

        if (!session) {
            const workspace = await DemoWorkspace.create({
                name: `Demo Workspace - ${sessionId.slice(0, 8)}`,
                type: 'demo',
                status: 'active',
            })

            await DemoSession.create({
                sessionId,
                workspaceId: workspace._id,
            })

            return res.json({
                success: true,
                sessionId,
                workspaceId: workspace._id,
            })
        }

        session.lastActivityAt = new Date()
        await session.save()

        const workspace = await DemoWorkspace.findById(session.workspaceId)

        if (!workspace || workspace.status !== 'active') {
            return res.status(404).json({
                message: 'محیط دمو پیدا نشد.',
            })
        }

        return res.json({
            success: true,
            sessionId,
            workspaceId: workspace._id,
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