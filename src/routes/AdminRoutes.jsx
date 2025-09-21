import { Route, Routes } from 'react-router-dom'

import Layouts from '../layouts/Layouts'

import Dashboard from '../pages/admin/Dashboard/Dashboard'
import Profile from '../pages/shared/Profile/Profile'
import Land from '../pages/shared/Land/Land'
import Well from '../pages/shared/Well/Well'
import Lands from '../pages/shared/Lands/Lands'
import Wells from '../pages/shared/Wells/Wells'
import Users from '../pages/admin/Users/Users'
import Settings from '../pages/admin/Settings/Settings'
import SendNotification from '../pages/admin/SendNotification/SendNotification'

const AdminRoutes = () => (
	<Routes>
		<Route element={<Layouts />}>
			<Route index element={<Dashboard />} />

			<Route path='users'>
				<Route index element={<Users />} />
				<Route path=':userId' element={<Profile />} />
			</Route>

			<Route path='lands'>
				<Route index element={<Lands />} />
				<Route path=':landId' element={<Land />} />
			</Route>

			<Route path='wells'>
				<Route index element={<Wells />} />
				<Route path=':wellId' element={<Well />} />
			</Route>

			<Route path='settings' element={<Settings />} />
			<Route path='send-notification' element={<SendNotification />} />
		</Route>
	</Routes>
)

export default AdminRoutes
