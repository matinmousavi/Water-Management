import mongoose from '../config/database.js'

const demoSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DemoWorkspace',
            required: true,
            index: true,
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

export default mongoose.model('DemoSession', demoSessionSchema)