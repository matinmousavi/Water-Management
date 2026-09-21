import mongoose from '../config/database.js'

const demoWorkspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'resetting'],
            default: 'active',
        },
        lastActivityAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('DemoWorkspace', demoWorkspaceSchema)