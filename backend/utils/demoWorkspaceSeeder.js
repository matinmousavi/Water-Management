import mongoose from 'mongoose'

import DemoWorkspace from '../models/DemoWorkspace.model.js'
import User from '../models/User.model.js'
import Well from '../models/Well.model.js'
import Land from '../models/Land.model.js'

const DEMO_WORKSPACE_NAME = 'Demo Workspace'

const DEMO_USERS = [
    {
        role: 'admin',
        fullName: 'مدیر سیستم دمو',
        mobile: '09990000001',
        email: 'demo-admin@example.com',
        accountingCode: 'DEMO-ADM-001',
        address: 'تهران، میدان آزادی',
        status: 'active',
        profilePicture: null,
    },
    {
        role: 'irrigator',
        fullName: 'میرآب دمو',
        mobile: '09990000002',
        email: 'demo-irrigator@example.com',
        accountingCode: 'DEMO-IRR-001',
        address: 'تهران، میدان آزادی',
        status: 'active',
        profilePicture: null,
    },
    {
        role: 'landOwner',
        fullName: 'مالک زمین دمو',
        mobile: '09990000003',
        email: 'demo-landowner@example.com',
        accountingCode: 'DEMO-LND-001',
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

export const seedDemoWorkspace = async () => {
    let workspace = await DemoWorkspace.findOne({
        name: DEMO_WORKSPACE_NAME,
    })

    if (!workspace) {
        workspace = await DemoWorkspace.create({
            name: DEMO_WORKSPACE_NAME,
            status: 'active',
        })

        console.log('✅ Demo workspace created.')
    }

    const users = {}

    for (const userData of DEMO_USERS) {
        let user = await User.findOne({
            mobile: userData.mobile,
        })

        if (!user) {
            user = await User.create({
                ...userData,
                workspaceId: workspace._id,
            })

            console.log(`✅ Demo user "${user.fullName}" created.`)
        } else if (!user.workspaceId) {
            user.workspaceId = workspace._id
            await user.save()

            console.log(`🔗 Demo user "${user.fullName}" linked to demo workspace.`)
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

        if (!well.lands.some(id => id.toString() === landId.toString())) {
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