import { Routes, Route } from 'react-router-dom'
import Layouts from '../layouts/Layouts'
import { useUser } from '../contexts/UserContext'

import Dashboard from '../pages/shared/Dashboard/Dashboard'
import Users from '../pages/admin/Users/Users'
import Profile from '../pages/shared/Profile/Profile'
import Lands from '../pages/shared/Lands/Lands'
import Land from '../pages/shared/Land/Land'
import Wells from '../pages/shared/Wells/Wells'
import Well from '../pages/shared/Well/Well'
import NotificationSettings from '../pages/admin/NotificationSettings/NotificationSettings'

const LayoutRoutes = () => {
	const { isAdmin, isIrrigator } = useUser()

	return (
		<Routes>
			<Route element={<Layouts />}>
				<Route index element={<Dashboard />} />
				<Route path='/profile' element={<Profile />} />

				{isAdmin && (
					<>
						<Route path='/users' element={<Users />} />
						<Route path='/users/:userId' element={<Profile />} />

						<Route path='/lands' element={<Lands />} />
						<Route path='/lands/:landId' element={<Land />} />
						<Route path='/notification-settings' element={<NotificationSettings />} />
					</>
				)}

				{(isIrrigator || isAdmin) && (
					<>
						<Route path='/wells' element={<Wells />} />
						<Route path='/wells/:wellId' element={<Well />} />
					</>
				)}
			</Route>
		</Routes>
	)
}

export default LayoutRoutes
