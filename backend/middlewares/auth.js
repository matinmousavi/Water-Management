import jwt from 'jsonwebtoken'

import User from '../models/User.model.js'
import DemoWorkspace from '../models/DemoWorkspace.model.js'

export async function authMiddleware(req, res, next) {
    const token = req.cookies?.token

    if (!token) {
        req.user = null
        req.isLogin = false
        req.isAdmin = false
        req.workspaceId = null
        req.workspaceType = null
        return next()
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findOne({
            _id: decoded.userId,
            mobile: decoded.mobile,
        }).populate('profilePicture')

        if (!user || !user.workspaceId) {
            req.user = null
            req.isLogin = false
            req.isAdmin = false
            req.workspaceId = null
            req.workspaceType = null
            return next()
        }

        const workspace = await DemoWorkspace.findOne({
            _id: user.workspaceId,
            status: 'active',
        })

        if (!workspace) {
            req.user = null
            req.isLogin = false
            req.isAdmin = false
            req.workspaceId = null
            req.workspaceType = null
            return next()
        }

        req.user = user
        req.isLogin = true
        req.isAdmin = user.role === 'admin'
        req.workspaceId = workspace._id
        req.workspaceType = workspace.type

        next()
    } catch {
        req.user = null
        req.isLogin = false
        req.isAdmin = false
        req.workspaceId = null
        req.workspaceType = null
        next()
    }
}

export function isLogin(req, res, next) {
    if (!req.isLogin) {
        return res.status(401).json({
            message: 'دسترسی غیرمجاز',
        })
    }

    next()
}

export function isAdmin(req, res, next) {
    isLogin(req, res, () => {
        if (!req.isAdmin) {
            return res.status(406).json({
                message: 'دسترسی ممنوع',
            })
        }

        next()
    })
}