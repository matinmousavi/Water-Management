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
import Notifications from '../pages/admin/Settings/Notifications/Notifications'

const LayoutRoutes = () => {
	const { isAdmin, isIrrigator, isLandOwner } = useUser()

	return (
		<Routes>
			<Route element={<Layouts />}>
				<Route index element={<Dashboard />} />
				<Route path='/profile' element={<Profile />} />

				<Route path='/wells/:wellId' element={<Well />} />
				<Route path='/lands/:landId' element={<Land />} />

				{isAdmin && (
					<>
						<Route path='/users' element={<Users />} />
						<Route path='/users/:userId' element={<Profile />} />

						<Route path='/settings' element={<Notifications />} />
					</>
				)}

				{(isIrrigator || isAdmin) && (
					<>
						<Route path='/wells' element={<Wells />} />
					</>
				)}

				{(isLandOwner || isAdmin) && (
					<>
						<Route path='/lands' element={<Lands />} />
					</>
				)}
			</Route>
		</Routes>
	)
}

export default LayoutRoutes
