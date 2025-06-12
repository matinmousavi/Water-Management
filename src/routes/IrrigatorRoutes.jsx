import { Route, Routes } from 'react-router-dom'

import Layouts from '../layouts/Layouts'

import Dashboard from '../pages/shared/Dashboard/Dashboard'
import Profile from '../pages/shared/Profile/Profile'
import Land from '../pages/shared/Land/Land'
import Well from '../pages/shared/Well/Well'
import Wells from '../pages/shared/Wells/Wells'

const IrrigatorRoutes = () => (
	<Routes element={<Layouts />}>
		<Route index element={<Dashboard />} />
		<Route path='profile' element={<Profile />} />

		<Route path='lands'>
			<Route path=':landId' element={<Land />} />
		</Route>

		<Route path='wells'>
			<Route index element={<Wells />} />
			<Route path=':wellId' element={<Well />} />
		</Route>
	</Routes>
)

export default IrrigatorRoutes
