import crypto from 'crypto'

import DemoWorkspace from '../models/DemoWorkspace.model.js'
import User from '../models/User.model.js'
import Well from '../models/Well.model.js'
import Land from '../models/Land.model.js'

const DEMO_USERS = [
    {
        role: 'admin',
        fullName: 'مدیر سیستم دمو',
        address: 'تهران، میدان آزادی',
        status: 'active',
        profilePicture: null,
    },
    {
        role: 'irrigator',
        fullName: 'میرآب دمو',
        address: 'تهران، میدان آزادی',
        status: 'active',
        profilePicture: null,
    },
    {
        role: 'landOwner',
        fullName: 'مالک زمین دمو',
        address: 'تهران، میدان آزادی',
        status: 'active',
        profilePicture: null,
    },
]

const DEMO_LANDS = [
    {
        title: 'زمین شمالی دمو',
        area: 1000,
        kFactor: 0.8,
        cropType: 'گندم',
        irrigationType: 'قطره‌ای',
        location: 'منطقه ۱',
        notificationsEnabled: true,
    },
    {
        title: 'زمین مرکزی دمو',
        area: 1500,
        kFactor: 0.9,
        cropType: 'جو',
        irrigationType: 'بارانی',
        location: 'منطقه ۲',
        notificationsEnabled: true,
    },
    {
        title: 'زمین جنوبی دمو',
        area: 1200,
        kFactor: 0.85,
        cropType: 'ذرت',
        irrigationType: 'سطحی',
        location: 'منطقه ۳',
        notificationsEnabled: true,
    },
]

const DEMO_WELLS = [
    {
        title: 'چاه دمو ۱',
        licenseCode: 'DEMO-WELL-001',
        location: 'منطقه شمالی',
        cycleDays: 7,
        cycleStartDate: new Date(),
        status: 'active',
    },
    {
        title: 'چاه دمو ۲',
        licenseCode: 'DEMO-WELL-002',
        location: 'منطقه مرکزی',
        cycleDays: 10,
        cycleStartDate: new Date(),
        status: 'active',
    },
    {
        title: 'چاه دمو ۳',
        licenseCode: 'DEMO-WELL-003',
        location: 'منطقه جنوبی',
        cycleDays: 5,
        cycleStartDate: new Date(),
        status: 'active',
    },
]

const createWorkspaceKey = workspaceId => {
    return crypto
        .createHash('sha256')
        .update(workspaceId.toString())
        .digest('hex')
        .slice(0, 7)
        .toUpperCase()
}

const createNumericWorkspaceKey = workspaceId => {
    const hash = crypto
        .createHash('sha256')
        .update(workspaceId.toString())
        .digest('hex')

    const numericValue = parseInt(hash.slice(0, 8), 16) % 10000000

    return numericValue.toString().padStart(7, '0')
}

const createDemoUserData = (userData, workspaceKey, numericWorkspaceKey, index) => {
    const mobile = `099${numericWorkspaceKey}${index}`

    return {
        ...userData,
        mobile,
        email: `demo-${userData.role}-${workspaceKey.toLowerCase()}@example.com`,
        accountingCode: `DEMO-${userData.role.toUpperCase()}-${workspaceKey}`,
    }
}

export const seedDemoWorkspace = async workspaceId => {
    const workspace = await DemoWorkspace.findOne({
        _id: workspaceId,
        type: 'demo',
        status: 'active',
    })

    if (!workspace) {
        throw new Error('Demo workspace not found.')
    }

    const workspaceKey = createWorkspaceKey(workspace._id)
    const numericWorkspaceKey = createNumericWorkspaceKey(workspace._id)

    const users = {}

    for (let index = 0; index < DEMO_USERS.length; index += 1) {
        const userData = createDemoUserData(
            DEMO_USERS[index],
            workspaceKey,
            numericWorkspaceKey,
            index + 1
        )

        let user = await User.findOne({
            workspaceId: workspace._id,
            role: userData.role,
        })

        if (!user) {
            user = await User.create({
                ...userData,
                workspaceId: workspace._id,
            })

            console.log(`✅ Demo user "${user.fullName}" created.`)
        }

        users[userData.role] = user
    }

    const lands = []

    for (const landData of DEMO_LANDS) {
        let land = await Land.findOne({
            title: landData.title,
            workspaceId: workspace._id,
        })

        if (!land) {
            land = await Land.create({
                ...landData,
                owner: users.landOwner._id,
                workspaceId: workspace._id,
                status: 'active',
                groupMemberships: [],
            })

            console.log(`✅ Demo land "${land.title}" created.`)
        } else if (
            !land.owner ||
            land.owner.toString() !== users.landOwner._id.toString()
        ) {
            land.owner = users.landOwner._id
            await land.save()
        }

        lands.push(land)
    }

    for (let index = 0; index < DEMO_WELLS.length; index += 1) {
        const wellData = DEMO_WELLS[index]

        let well = await Well.findOne({
            licenseCode: wellData.licenseCode,
            workspaceId: workspace._id,
        })

        if (!well) {
            well = await Well.create({
                ...wellData,
                workspaceId: workspace._id,
                irrigator: users.irrigator._id,
                lands: [lands[index]._id],
                landGroups: [],
            })

            console.log(`✅ Demo well "${well.title}" created.`)
            continue
        }

        const landId = lands[index]._id

        if (
            !well.lands.some(
                id => id.toString() === landId.toString()
            )
        ) {
            well.lands.push(landId)
        }

        if (!well.irrigator) {
            well.irrigator = users.irrigator._id
        }

        await well.save()
    }

    return {
        workspace,
        users,
        lands,
    }
}