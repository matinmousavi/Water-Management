import { Router } from 'express'
import crypto from 'crypto'

import DemoSession from '../../models/DemoSession.model.js'
import DemoWorkspace from '../../models/DemoWorkspace.model.js'
import { seedDemoWorkspace } from '../../utils/demoWorkspaceSeeder.js'

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

router.get('/session', async (req, res) => {
    try {
        let sessionId = req.cookies?.[SESSION_COOKIE]

        if (!sessionId) {
            sessionId = crypto.randomUUID()

            const workspace = await createDemoWorkspace(sessionId)

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

        let session = await DemoSession.findOne({
            sessionId,
        })

        if (!session) {
            const workspace = await createDemoWorkspace(sessionId)

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

        const workspace = await DemoWorkspace.findOne({
            _id: session.workspaceId,
            type: 'demo',
            status: 'active',
        })

        if (!workspace) {
            session = await DemoSession.deleteOne({
                _id: session._id,
            })

            const newSessionId = crypto.randomUUID()
            const newWorkspace = await createDemoWorkspace(newSessionId)

            res.cookie(SESSION_COOKIE, newSessionId, {
                httpOnly: true,
                secure: import.meta.env?.PROD,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            })

            return res.json({
                success: true,
                sessionId: newSessionId,
                workspaceId: newWorkspace._id,
            })
        }

        await seedDemoWorkspace(workspace._id)

        session.lastActivityAt = new Date()
        await session.save()

        workspace.lastActivityAt = new Date()
        await workspace.save()

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